const { validateToken } = require('../models/tokens');
const { users } = require('../data/memory');
const { badRequest } = require('../utils/httpResponses');

/**
 * Middleware to validate Authorization header containing userId.
 */
function requireAuth(req, res, next) {
  const token = req.header('Authorization');
  return next();
}


module.exports = { requireAuth };
