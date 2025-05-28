const { users } = require('../data/memory');
const { generateToken } = require('../models/tokensSchema');
const { badRequest, ok } = require('../utils/httpResponses');
const { unauthorized } = require('../utils/httpResponses');


/**
 * POST /api/tokens
 * Authenticates a user by username and password.
 * Sets them as the currently connected user.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
function login(req, res) {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);

  if (!user) {
    return unauthorized(res, 'Invalid username or password');
  }

  // Return user.id as the token
  return ok(res, { token: String(user.id) });
}

module.exports = { login };
