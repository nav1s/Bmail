const users = require("../services/userService.js");
const { httpError } = require("../utils/error");
const jwt = require("jsonwebtoken");
const config = require("../utils/config");

/**
 * Issue a JWT for a user after verifying username/password.
 * Returns `{ token, id }` on success.
 *
 * @param {import('express').Request} req - Body `{ username, password }`.
 * @param {import('express').Response} res - Sends 201 with `{ token, id }`.
 * @returns {Promise<void>} Sends the HTTP response.
 * @throws Sends 500 if JWT_SECRET is missing; propagates auth/service errors via httpError.
 */
async function login(req, res) {
  const key = config.JWT_SECRET;

  if (!key) {
    console.error("JWT_SECRET is not set in environment variables");
    return res.status(500).json({ error: "Internal server error" });
  }

  try {
    // Attempt login via user service
    const { username, password } = req.body;
    const user = await users.login(username, password);

    const data = { username: user.username };
    console.log(user.username);
    const token = jwt.sign(data, key);
    res.status(201).json({ token, id: user._id });
  } catch (err) {
    console.error("Error during login:", err);
    // Error if there was a problem connecting
    return httpError(res, err);
  }
}

module.exports = { login };
