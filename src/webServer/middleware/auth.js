const { validateToken } = require('../models/tokens');
const { users } = require('../data/memory');
const { badRequest } = require('../utils/httpResponses');

/**
 * Middleware to validate Authorization header containing userId.
 */
function requireAuth(req, res, next) {
  const token = req.header('Authorization');

  // Verefies we got a token
  if (!token) {
    return badRequest(res, 'Missing Authorization header');
  }

  // Validates token
  const validated = validateToken(token, users);
  if (!validated) {
    return badRequest(res, 'Invalid or unknown user token');
  }

  req.loginToken = validated;
  next();
}

module.exports = { requireAuth };
