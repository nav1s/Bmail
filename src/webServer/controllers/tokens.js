const { users } = require('../data/memory');
const { generateToken } = require('../models/tokens');
const { badRequest, created } = require('../utils/httpResponses');

/**
 * POST /api/tokens
 * Authenticates a user by username and password.
 * Returns user.id as "token".
 */
function login(req, res) {
  const { username, password } = req.body;

  // Verefies username and password are given
  if (!username || !password) {
    return badRequest(res, 'Username and password are required');
  }

  // Checks for user and password through hard values (===)
  const user = users.find(u => u.username === username && u.password === password);

  if (!user) {
    return badRequest(res, 'Invalid username or password');
  }

  // Generated token
  const token = generateToken(user.id);
  
  return created(res, { token });
}

module.exports = { login };
