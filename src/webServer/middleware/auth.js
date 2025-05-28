const { users } = require('../data/memory');

/**
 * Middleware to authenticate user from Authorization header (user ID).
 */
function requireAuth(req, res, next) {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ error: 'You must be logged in' });
  }

  const userId = parseInt(token, 10);
  const user = users.find(u => u.id === userId);

  if (!user) {
    return res.status(401).json({ error: 'Invalid token or user not found' });
  }

  req.user = user;
  next();
}

module.exports = { requireAuth };
