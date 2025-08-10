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
  if (req.headers.authorization) {
    const token = req.headers.authorization.split(" ")[1];
    try {
      const data = jwt.verify(token, key);
      const user = await users.findUserByUsername(data.username);
      if (!user.id && user._id) {
        user.id = user._id.toString();
      }
      req.user = user;
      console.log('The logged in user is: ' + data.username + ' id: ' + user.id );

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
