const users = require('../models/users.js')
const { ok } = require('../utils/httpResponses');
const { unauthorized } = require('../utils/httpResponses');


/**
 * POST /api/tokens
 * Authenticates a user by username and password.
 * Returns their user ID as a token if successful.
 */
function login(req, res) {
  try {
    // searching for user and trying to login
    const { username, password } = req.body;
    const user = users.login(username, password);
    return ok(res, { token: String(user.id) });

  } catch (err) {
    // Error if there was a problem connecting
    return unauthorized(res, err.message);
  }
}

module.exports = { login };

