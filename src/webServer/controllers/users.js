const users = require('../models/users.js');
const { badRequest, created, notFound, ok } = require('../utils/httpResponses');

/**
 * Handles user registration using centralized field schema config.
 */
exports.createUser = (req, res) => {
  const requiredFields = users.getRequiredFields();
  const missing = requiredFields.filter(field => !req.body[field]);

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

  console.log(`User created with ID: ${result.id}`);
  return created(res, result.id);
}


/**
 * GET /api/users/:id
 * Returns public user details for a given user ID
 */
exports.getUserById = (req, res) => {
  const id = parseInt(req.params.id, 10);
  const user = users.findUserById(id);

  if (!user) {
    return notFound(res, 'User not found');
  }

  // Use field visibility config to return safe subset of user fields
  const publicUser = users.filterUserByVisibility(user, 'public');

  return ok(res, publicUser);
}
