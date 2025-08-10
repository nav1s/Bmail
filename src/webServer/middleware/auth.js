const users = require('../services/userService');
const jwt = require("jsonwebtoken")
require('custom-env').env();

/**
 * Middleware to authenticate user from Authorization header (user ID).
 */
async function requireAuth(req, res, next) {
  const key = process.env.JWT_SECRET 
  if (!key) {
    console.error('JWT_SECRET is not set in environment variables');
    return res.status(500).json({ error: 'Internal server error' });
  }
  console.log("1.1");
  if (req.headers.authorization) {
    console.log("1.2");
    const token = req.headers.authorization.split(" ")[1];
    try {
      const data = jwt.verify(token, key);
      console.log('The logged in user is: ' + data.username);

      const user = await users.findUserByUsername(data.username);
      req.user = user;

      return next()
    } catch (err) {
      console.error(err);
      return res.status(401).json({ error: 'You must be logged in' });
    }
  }
  else {
    return res.status(401).send('Token required');
  }

}



module.exports = { requireAuth };
