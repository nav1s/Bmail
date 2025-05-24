const { state } = require('../data/memory');

function requireAuth(req, res, next) {
  if (!state.connectedUser) {
    return res.status(401).json({ error: 'Need to be logged in to perform this action' });
  }

  req.user = state.connectedUser;
  next();
}

module.exports = { requireAuth };
