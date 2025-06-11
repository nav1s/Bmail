const users = require('../models/users.js')
const { httpError } = require('../utils/error');
const jwt = require("jsonwebtoken")


/**
 * POST /api/tokens
 * Authenticates a user by username and password.
 * Returns their user ID as a token if successful.
 */
function login(req, res) {
  const key = process.env.JWT_SECRET 

  if (!key) {
    console.error('JWT_SECRET is not set in environment variables');
    return res.status(500).json({ error: 'Internal server error' });
  }

  try {
    // searching for user and trying to login
    const { username, password } = req.body;
    const user = users.login(username, password);

    const data = { username: user.username }
    const token = jwt.sign(data, key)
    res.status(201).json({ token });


  } catch (err) {
    console.error('Error during login:', err);
    // Error if there was a problem connecting
    return httpError(res, err);
  }
}

module.exports = { login };

