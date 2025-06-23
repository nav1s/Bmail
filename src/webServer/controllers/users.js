const users = require('../models/users.js');
const { badRequest, ok, createdWithLocation, noContent } = require('../utils/httpResponses');
const { httpError } = require('../utils/error');
const labels = require('../models/labels.js');


/**
 * @brief Checks if the provided password is strong enough.
 * A strong password must:
 * - Be at least 8 characters long
 * - Contain at least one uppercase letter
 * - Contain at least one lowercase letter
 * - Contain at least one digit
 * - Contain at least one special character
 *
 * @param {string} password - The password to check.
 * @returns {boolean} True if the password is strong enough, false otherwise.
 */
isPasswordStrongEnough = (password) => {
  // Check if the password is at least 8 characters long
  if (password.length < 8) {
    return false;
  }

  // Check if the password contains at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return false;
  }

  // Check if the password contains at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    return false;
  }

  // Check if the password contains at least one digit
  if (!/\d/.test(password)) {
    return false;
  }

  // Check if the password contains at least one special character
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return false;
  }

  return true;
}

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

  // parses data into json
  const userData = {};
  for (const field of requiredFields) {
    userData[field] = req.body[field];

    console.log('File upload detected:', req.file);
    imageUrl = `/uploads/${req.file.filename}`;
    console.log('Image URL:', imageUrl);
    userData['image'] = imageUrl;
  }

  const userPass = req.body.password;
  // check if the password is strong enough
  if (!isPasswordStrongEnough(userPass)) {
    return badRequest(res, 'Password is not strong enough');
  }

  // Trying to create a user, returning bad request with the error if failed
  try {
    const newUser = users.createUser(userData);
    // Create default labels for the new user
    labels.createDefaultLabels(newUser.id);
    return createdWithLocation(res, `/api/users/${newUser.id}`);
  } catch (err) {
    console.error('Error creating user:', err);
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
 * GET /api/users/:username
 * Returns public user details for a given username
 */
exports.getUserByUsername = (req, res) => {
  try {
    // searching for user
    const username = req.params.username;
    if (!username) {
      return badRequest(res, 'Username is required');
    }
    const user = users.findUserByUsername(username);

    // Returning only public user fields
    const publicUser = users.filterUserByVisibility(user, 'public');
    return ok(res, publicUser);
  } catch (err) {
    console.error('Error getting user by username:', err);
    return httpError(res, err);
  }
}


/**
 * PATCH /api/users
 * Edits the user with the given ID.
 * Requires login.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.updateUserById = (req, res) => {
  // throw an error if res doesn't contain body
  if ('body' in req === false || req.body === undefined) {
    return badRequest(res, 'Request body is required');
  }

  if ('password' in req.body) {
    // Check if the password is strong enough
    if (!isPasswordStrongEnough(req.body.password)) {
      return badRequest(res, 'Password is not strong enough');
    }
  }

  try {
    users.updateUserById(req.user, req.body);
  }
  catch (err) {
    console.error('Error updating user:', err);
    return httpError(res, err);
  }

  return noContent(res);
};

