const users = require('../models/users.js');
const { badRequest, ok, createdWithLocation, noContent } = require('../utils/httpResponses');
const { httpError } = require('../utils/error');


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
    return httpError(res, err);
  }
}


/**
 * GET /api/users/:id
 * Returns public user details for a given user ID
 */
exports.getUserById = (req, res) => {
  try {
    // searching for user
    const id = parseInt(req.params.id, 10);
    const user = users.findUserById(id);

    // Returning only public user fields
    const publicUser = users.filterUserByVisibility(user, 'public');
    return ok(res, publicUser);
  } catch (err) {
    return httpError(res, err);
  }
};


/**
 * PATCH /api/users
 * Edits the user with the given ID.
 * Requires login.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.updateUserById = (req, res) => {
  try {
    users.updateUserById(req.user, req.body);
  }
  catch (err) {
    console.error('Error updating user:', err);
    return httpError(res, err);
  }

  return noContent(res);
};

