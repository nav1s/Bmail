const { addUser } = require('../models/users');
const { users } = require('../data/memory');
const { badRequest, createdWithLocation, notFound } = require('../utils/httpResponses');
const { filterUserByVisibility, getRequiredFields } = require('../models/userSchema');

/**
 * Handles user registration using centralized field schema config.
 */
function register(req, res) {
  // Use global schema config
  const requiredFields = getRequiredFields();

  // Check for missing fields
  const missing = requiredFields.filter(field => !req.body[field]);
  if (missing.length > 0) {
    return badRequest(res, `Missing fields: ${missing.join(', ')}`);
  }

  // Extract valid fields from req.body
  const userData = {};
  for (const field of requiredFields) {
    userData[field] = req.body[field];
  }

  const result = addUser(userData);
  if (!result.success) {
    return badRequest(res, result.error);
  }

  return createdWithLocation(res, `/api/users/${result.user.id}`);
}

/**
 * GET /api/users/:id
 * Returns public user details for a given user ID
 *
 * This uses a centralized field visibility config to control which
 * user fields are exposed (currently defined in userSchema.js).
 * Fields like 'password' are excluded automatically.
 *
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 */
function getUserById(req, res) {
  const id = parseInt(req.params.id, 10);
  const user = users.find(u => u.id === id);

  if (!user) {
    return notFound(res, 'User not found');
  }

  // Use field visibility config to return safe subset of user fields
  const publicUser = filterUserByVisibility(user, 'public');

  res.json(publicUser);
}

module.exports = { register, getUserById };