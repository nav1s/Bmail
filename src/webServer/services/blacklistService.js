const net = require('net');

const BLOOM_HOST = process.env.BLOOM_HOST || 'bloom-filter';
const BLOOM_PORT = Number(process.env.BLOOM_PORT || 12345);

/**
 * Low-level single-line request/response to bloom server.
 * Update this if your protocol differs. For example:
 *  - CHECK <url>\n  -> returns "1" or "0"
 *  - ADD <url>\n    -> returns "OK"
 */
function sendBloomCommand(cmd, payload) {
  const line = `${cmd} ${payload}\n`;
  console.log("line to write:", line.trim());

  return new Promise((resolve, reject) => {
    const socket = net.createConnection({ host: BLOOM_HOST, port: BLOOM_PORT });
    let buf = '';
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

    socket.setEncoding('utf8');
    socket.setNoDelay(true);
    socket.setTimeout(5000);

    socket.on('connect', () => {
      console.log("connecting to server", BLOOM_HOST, BLOOM_PORT);
      socket.write(line);
    });

    socket.on('data', (chunk) => {
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
      if (buf.includes('\n\n')) {
        clearTimeout(idleTimer);
        idleTimer = setTimeout(finish, 5);
      }
    });

    socket.on('end', finish);
    socket.on('timeout', () => {
      socket.destroy();
      reject(new Error('bloom socket timeout'));
    });
    socket.on('error', (err) => {
      if (!resolved) reject(err);
    });
  });
}



function normalizeUrls(urls) {
  return (urls || [])
    .map(u => (typeof u === 'string' ? u.trim() : ''))
    .filter(Boolean);
}

/**
 * Check if a single URL is blacklisted.
 * @param {string} url
 * @returns {Promise<boolean>}
 */
async function isUrlBlacklisted(url) {
  console.log("checking if url: " + url + "is blacklisted")
  const resp = await sendBloomCommand('GET', url);
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
 * Returns true if ANY of the given URLs are blacklisted.
 * @param {string[]} urls
 * @returns {Promise<boolean>}
 */
async function anyUrlBlacklisted(urls) {
  for (const u of urls) {
    if (await isUrlBlacklisted(u)) return true;
  }
  return false;
}

/**
 * Add a set of URLs to the blacklist.
 * @param {string[]} urls
 * @returns {Promise<number>} how many were attempted/added
 */
async function addUrlsToBlacklist(urls) {
  let count = 0;
  for (const u of urls) {
    console.log("sending request: " + 'POST', u)
    const resp = await sendBloomCommand('POST', u);
    if (/\b201 Created\b/.test(resp) || /^\s*OK\s*$/i.test(resp) || /^\s*1\s*$/m.test(resp)) {
      count += 1;
    }
  }
  return count;
}

/**
 * Optional: remove urls (only if your server supports it)
 */
async function removeUrlsFromBlacklist(urls) {
  let count = 0;
  for (const u of urls) {
    const resp = await sendBloomCommand('DELETE', u);
    if (/\b204 No Content\b/.test(resp) || /^\s*OK\s*$/i.test(resp) || /^\s*1\s*$/m.test(resp)) {
      count += 1;
    }
  }
  return count;
}

/** Check if a URL is currently tagged in the bloomfilter. */
async function checkUrl(url) {
  const u = normalizeUrl(url);
  if (!u) throw createError('Invalid URL', { status: 400 });
  return await isUrlBlacklisted(u);
}

/** Add a URL to the bloomfilter blacklist. */
async function addUrl(url) {
  const u = normalizeUrl(url);
  if (!u) throw createError('Invalid URL', { status: 400 });
  await addUrlsToBlacklist([u]);
  return true;
}

/** Remove a URL from the bloomfilter blacklist. */
async function removeUrl(url) {
  const u = normalizeUrl(url);
  if (!u) throw createError('Invalid URL', { status: 400 });
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
