const users = require('../models/users');

/**
 * Middleware to authenticate user from Authorization header (user ID).
 */
function requireAuth(req, res, next) {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ error: 'You must be logged in' });
  }

  const userId = parseInt(token, 10);
  try {
    const user = users.findUserById(userId);
    req.user = user;
    next();

  } catch (err) {
    return res.status(401).json({ error: 'Invalid token or user not found' });
  }

}

module.exports = { requireAuth };
