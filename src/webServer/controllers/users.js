const { addUser } = require('../models/users');
const { badRequest, createdWithLocation } = require('../utils/httpResponses');

/**
 * Handles user registration with dynamic field validation and extraction.
 *
 * @route POST /api/users
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 */
function register(req, res) {
  /**
   * Config of all required fields for user registration.
   * Add new fields here to enable validation and extraction.
   */
  const fieldConfig = {
    firstName: true,
    lastName: true,
    username: true,
    password: true
  };

  // Checks all frields exists
  const missing = Object.keys(fieldConfig).filter(
    field => !req.body[field]
  );

  if (missing.length > 0) {
    return badRequest(res, `Missing fields: ${missing.join(', ')}`);
  }

  // Extract all fields from req.body into userData
  const userData = {};
  for (const field in fieldConfig) {
    userData[field] = req.body[field];
  }

  const result = addUser(userData);

  if (!result.success) {
    return badRequest(res, result.error);
  }

  return createdWithLocation(res, `/api/users/${result.user.id}`);
}

module.exports = { register };
