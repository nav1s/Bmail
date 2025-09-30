const net = require("net");

const BLOOM_FILTER_HOST = process.env.BLOOM_FILTER_HOST || "bloom-filter";
const BLOOM_FILTER_PORT = Number(process.env.BLOOM_FILTER_PORT || 12345);

/**
 * Send a single-line command to the bloom server and read its reply.
 * The protocol is simple: `${CMD} ${payload}\n` → one short textual response.
 *
 * @param {string} cmd - e.g., 'GET' | 'POST' | 'DELETE'.
 * @param {string} payload - Usually the URL to act on.
 * @returns {Promise<string>} Raw server response (trimmed).
 * @throws {Error} Socket timeout or connection error.
 */
function sendBloomCommand(cmd, payload) {
  const line = `${cmd} ${payload}\n`;
  console.log("line to write:", line.trim());

  return new Promise((resolve, reject) => {
    const socket = net.createConnection({
      host: BLOOM_FILTER_HOST,
      port: BLOOM_FILTER_PORT,
    });
    let buf = "";
    let resolved = false;
    let idleTimer = null;

    const finish = () => {
      if (resolved) return;
      resolved = true;
      clearTimeout(idleTimer);
      // make sure we trim trailing newlines etc.
      const out = buf.trim();
      console.log("bloom response:", JSON.stringify(out));
      socket.destroy();
      resolve(out);
    };

    socket.setEncoding("utf8");
    socket.setNoDelay(true);
    socket.setTimeout(5000);

    socket.on("connect", () => {
      console.log("connecting to server", BLOOM_FILTER_HOST, BLOOM_FILTER_PORT);
      socket.write(line);
    });

    socket.on("data", (chunk) => {
      const s = chunk.toString();
      console.log("bloom<= chunk:", JSON.stringify(s));
      buf += s;

      // reset a short idle timer; if no more data arrives, finish()
      clearTimeout(idleTimer);
      idleTimer = setTimeout(finish, 40);

      // fast-path: if we already have a status line that doesn't expect a body,
      // we can finish sooner. (201/204/404 commonly come as single line)
      if (/^(201 Created|204 No Content|404 Not Found)\b/m.test(buf)) {
        clearTimeout(idleTimer);
        idleTimer = setTimeout(finish, 5);
      }
      // if server uses "200 OK\n\n<body>", wait for blank line, then finish soon
      if (buf.includes("\n\n")) {
        clearTimeout(idleTimer);
        idleTimer = setTimeout(finish, 5);
      }
    });

    socket.on("end", finish);
    socket.on("timeout", () => {
      socket.destroy();
      reject(new Error("bloom socket timeout"));
    });
    socket.on("error", (err) => {
      if (!resolved) reject(err);
    });
  });
}

/**
 * Normalize an array of URLs: trim strings and drop falsy values.
 * Used before batch operations.
 *
 * @param {string[]} urls - Raw list (may contain non-strings/empties).
 * @returns {string[]} Cleaned, non-empty strings.
 */
function normalizeUrls(urls) {
  return (urls || [])
    .map((u) => (typeof u === "string" ? u.trim() : ""))
    .filter(Boolean);
}

/**
 * Check if a single URL is currently blacklisted by the bloom service.
 * Accepts several response formats (1/0, "true"/"false", or "200 OK …").
 *
 * @param {string} url - URL to check.
 * @returns {Promise<boolean>} True if blacklisted, else false.
 * @throws {Error} If the bloom command fails.
 */
async function isUrlBlacklisted(url) {
  console.log("checking if url: " + url + "is blacklisted");
  const resp = await sendBloomCommand("GET", url);
  // Accept either a raw boolean/1|0 or the "200 OK … true|false" style
  if (/^\s*1\s*$/m.test(resp)) return true;
  if (/^\s*0\s*$/m.test(resp)) return false;
  if (/\b200 OK\b/.test(resp) && /\btrue\s+(true|false)\b/i.test(resp)) {
    // "true true" => exists AND blacklisted
    return /\btrue\s+true\b/i.test(resp);
  }
  if (/^\s*true\s*$/i.test(resp)) return true;
  if (/^\s*false\s*$/i.test(resp)) return false;
  return false;
}

/**
 * Quick boolean: return true if any URL in the list is blacklisted.
 * Iterates sequentially; fine for small arrays.
 *
 * @param {string[]} urls - URLs to test.
 * @returns {Promise<boolean>} True if at least one is blacklisted.
 * @throws {Error} Propagates network/protocol failures.
 */
async function anyUrlBlacklisted(urls) {
  for (const u of urls) {
    if (await isUrlBlacklisted(u)) return true;
  }
  return false;
}

/**
 * Add each URL to the blacklist via the bloom server.
 * Counts how many succeeded based on permissive OK patterns.
 *
 * @param {string[]} urls - URLs to add.
 * @returns {Promise<number>} Number of URLs that were accepted.
 * @throws {Error} If the bloom command fails.
 */
async function addUrlsToBlacklist(urls) {
  let count = 0;
  for (const u of urls) {
    console.log("sending request: " + "POST", u);
    const resp = await sendBloomCommand("POST", u);
    if (
      /\b201 Created\b/.test(resp) ||
      /^\s*OK\s*$/i.test(resp) ||
      /^\s*1\s*$/m.test(resp)
    ) {
      count += 1;
    }
  }
  return count;
}

/**
 * Remove URLs from the blacklist (if the server supports DELETE).
 * Uses the same permissive success patterns as add.
 *
 * @param {string[]} urls - URLs to remove.
 * @returns {Promise<number>} Number of URLs confirmed removed.
 * @throws {Error} If the bloom command fails.
 */
async function removeUrlsFromBlacklist(urls) {
  let count = 0;
  for (const u of urls) {
    const resp = await sendBloomCommand("DELETE", u);
    if (
      /\b204 No Content\b/.test(resp) ||
      /^\s*OK\s*$/i.test(resp) ||
      /^\s*1\s*$/m.test(resp)
    ) {
      count += 1;
    }
  }
  return count;
}

/**
 * Check a single URL through the public API wrapper.
 * Normalizes input and delegates to the checker.
 *
 * @param {string} url - URL to check.
 * @returns {Promise<boolean>} True if blacklisted, else false.
 * @throws {Error} 400 if URL is invalid; network/protocol errors otherwise.
 */
async function checkUrl(url) {
  const u = normalizeUrl(url);
  if (!u) throw createError("Invalid URL", { status: 400 });
  return await isUrlBlacklisted(u);
}

/**
 * Add one URL to the blacklist through the public API wrapper.
 * Normalizes input and uses the batch adder under the hood.
 *
 * @param {string} url - URL to add.
 * @returns {Promise<boolean>} True on success.
 * @throws {Error} 400 if URL is invalid; network/protocol errors otherwise.
 */
async function addUrl(url) {
  const u = normalizeUrl(url);
  if (!u) throw createError("Invalid URL", { status: 400 });
  await addUrlsToBlacklist([u]);
  return true;
}

/**
 * Remove one URL from the blacklist through the public API wrapper.
 * Normalizes input and uses the batch remover.
 *
 * @param {string} url - URL to remove.
 * @returns {Promise<boolean>} True on success.
 * @throws {Error} 400 if URL is invalid; network/protocol errors otherwise.
 */
async function removeUrl(url) {
  const u = normalizeUrl(url);
  if (!u) throw createError("Invalid URL", { status: 400 });
  await removeUrlsFromBlacklist([u]);
  return true;
}

module.exports = {
  isUrlBlacklisted,
  anyUrlBlacklisted,
  addUrlsToBlacklist,
  removeUrlsFromBlacklist,
  checkUrl,
  addUrl,
  removeUrl,
};
