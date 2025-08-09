// services/blacklistService.js
// Thin wrapper around the Bloom Filter server used for URL blacklisting.
// NOTE: Keep all bloom protocol details here so controllers/services stay clean.

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

  return new Promise((resolve, reject) => {
    const socket = new net.Socket();
    let buffer = '';

    socket.setTimeout(3000); // 3s safety
    socket.connect(BLOOM_PORT, BLOOM_HOST, () => {
      socket.write(line);
    });

    socket.on('data', (chunk) => {
      buffer += chunk.toString('utf8');
      // simple line protocol; adjust if your server frames differently
      if (buffer.includes('\n')) {
        socket.end();
      }
    });

    socket.on('end', () => resolve(buffer.trim()));
    socket.on('timeout', () => {
      socket.destroy();
      reject(new Error('Bloom server timeout'));
    });
    socket.on('error', reject);
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
  if (!url) return false;
  const resp = await sendBloomCommand('CHECK', url);
  // Adjust according to your server’s response (“1”/“0”, “OK/ERR”, etc.)
  return resp === '1' || resp.toLowerCase() === 'true' || resp.toUpperCase() === 'OK';
}

/**
 * Returns true if ANY of the given URLs are blacklisted.
 * @param {string[]} urls
 * @returns {Promise<boolean>}
 */
async function anyUrlBlacklisted(urls) {
  const list = normalizeUrls(urls);
  for (const u of list) {
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
  const list = normalizeUrls(urls);
  let count = 0;
  for (const u of list) {
    const resp = await sendBloomCommand('ADD', u);
    // Treat OK/True/1 as success; adjust if your server replies differently
    if (resp === '1' || resp.toLowerCase() === 'true' || resp.toUpperCase() === 'OK') {
      count += 1;
    }
  }
  return count;
}

/**
 * Optional: remove urls (only if your server supports it)
 */
async function removeUrlsFromBlacklist(urls) {
  const list = normalizeUrls(urls);
  let count = 0;
  for (const u of list) {
    const resp = await sendBloomCommand('REMOVE', u);
    if (resp === '1' || resp.toLowerCase() === 'true' || resp.toUpperCase() === 'OK') {
      count += 1;
    }
  }
  return count;
}

module.exports = {
  isUrlBlacklisted,
  anyUrlBlacklisted,
  addUrlsToBlacklist,
  removeUrlsFromBlacklist,
};
