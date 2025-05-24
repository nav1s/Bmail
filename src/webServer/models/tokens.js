const { tokens } = require('../data/memory');

/**
 * Generates a "token" for a user — currently just returns the userId as asked from Hemi.
 */
function generateToken(userId) {
  return userId.toString();
}

/**
 * Validates a "token" and returns the userId if it's valid.
 * For now, just parses it as a number and checks if it's a known user ID.
 */
function validateToken(token, users) {
  const userId = parseInt(token, 10);
  const exists = users.some(u => u.id === userId);
  return exists ? token : null;
}

/**
 * Resolves a user ID from a given token string.
 *
 * @param {string} token
 * @returns {number|null}
 */
function getUserIdFromToken(token) {
  return tokens[token]?.userId ?? null;
}

module.exports = { generateToken, validateToken, getUserIdFromToken };
