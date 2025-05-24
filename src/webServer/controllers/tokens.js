const { users, state } = require('../data/memory');
const { generateToken } = require('../models/tokensSchema');
const { badRequest, ok } = require('../utils/httpResponses');

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

  if (!username || !password) {
    return badRequest(res, 'Username and password are required');
  }

  const user = users.find(u => u.username === username && u.password === password);
  if (!user) {
    return badRequest(res, 'Invalid username or password');
  }

  state.connectedUser = user;

  const token = generateToken(user.id);
  return ok(res, { token });
}

module.exports = { login };
