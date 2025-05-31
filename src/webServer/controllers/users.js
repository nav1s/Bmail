const users = require('../models/users.js');
const { badRequest, notFound, ok, createdWithLocation } = require('../utils/httpResponses');

/**
 * @brief Handles HTTP request to create a new user.
 *
 * Validates the request body to ensure all required fields are present.
 * Delegates user creation to the model, and returns appropriate HTTP responses.
 * If a user with the same username already exists, a 400 Bad Request is returned.
 *
 * @param {Object} req - Express request object, expected to contain user fields in `req.body`.
 * @param {Object} res - Express response object used to send the result.
 * @returns {Object} HTTP Response:
 *   - 201 Created with `Location` header if successful.
 *   - 400 Bad Request if required fields are missing or username already exists.
 */
exports.createUser = (req, res) => {
  // Validate that the request body contains all required fields
  const requiredFields = users.getRequiredFields();
  const missing = requiredFields.filter(field => !req.body[field]);

  // If any required fields are missing, return a 400 Bad Request
  if (missing.length > 0) {
    return badRequest(res, `Missing fields: ${missing.join(', ')}`);
  }

  //parses data into json
  const userData = {};
  for (const field of requiredFields) {
    userData[field] = req.body[field];
  }
  
  // Trying to create a user, returning bad request with the error if failed
  try {
  const newUser = users.createUser(userData);
  return createdWithLocation(res, `/api/users/${newUser.id}`);
} catch (err) {
  return badRequest(res, err.message);
}
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
