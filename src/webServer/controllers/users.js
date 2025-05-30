const users = require('../models/users.js');
const { badRequest, notFound, ok, createdWithLocation } = require('../utils/httpResponses');

/**
 * @brief Creates a new user
 * @param req - Express request object
 * @param res - Express response object
 */
exports.createUser = (req, res) => {
  // Validate that the request body contains all required fields
  const requiredFields = users.getRequiredFields();
  // count the number of missing fields
  const missing = requiredFields.filter(field => !req.body[field]);

  // If any required fields are missing, return a 400 Bad Request
  if (missing.length > 0) {
    return badRequest(res, `Missing fields: ${missing.join(', ')}`);
  }

  const userData = {};

  for (const field of requiredFields) {
    userData[field] = req.body[field];
  }

  const result = users.createUser(userData);

  if (result.success === false) {
    return badRequest(res, result.error);
  }

  console.log(`User created with ID: ${result.newUser.id}`);
  return createdWithLocation(res, `/api/users/${result.newUser.id}`);
}


/**
 * GET /api/users/:id
 * Returns public user details for a given user ID
 */
exports.getUserById = (req, res) => {
  // convert the ID from string to integer
  const id = parseInt(req.params.id, 10);
  // find the user by ID
  const user = users.findUserById(id);

  // If user not found, return 404 Not Found
  if (!user) {
    return notFound(res, 'User not found');
  }

  // Use field visibility config to return safe subset of user fields
  const publicUser = users.filterUserByVisibility(user, 'public');

  // return the public user details
  return ok(res, publicUser);
}
