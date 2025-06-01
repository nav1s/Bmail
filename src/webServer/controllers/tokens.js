const users = require('../models/users.js')
const { ok } = require('../utils/httpResponses');
const { unauthorized } = require('../utils/httpResponses');


/**
 * POST /api/tokens
 * Authenticates a user by username and password.
 * Sets them as the currently connected user.
 */
function login(req, res) {
  const { username, password } = req.body;
  const user = users.login(username, password);

  if (!user) {
    return unauthorized(res, 'Invalid username or password');
  }

  // Return user.id as the token
  return ok(res, { token: String(user.id) });
}

module.exports = { login };
