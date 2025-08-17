// controllers/users.js
const {
  getRequiredFields,
  createUser: createUserService,
  findUserById,
  findUserByUsername,
  filterUserByVisibility,
  updateUserById: updateUserByIdService,
} = require('../services/userService');

const { badRequest, ok, createdWithLocation, noContent } = require('../utils/httpResponses');
const { httpError } = require('../utils/error');

/**
 * Create a new user record, with optional image uploaded via multer.
 * Required fields are determined by the user service.
 *
 * @param {import('express').Request} req - Body with required fields; optional `file` for image.
 * @param {import('express').Response} res - Sends 201 with Location header `/api/users/:id`.
 * @returns {Promise<void>} Sends the HTTP response.
 * @throws Sends 400 for missing required fields; 500 via httpError for service errors.
 */
async function createUser(req, res) {
  try {
    const required = typeof getRequiredFields === 'function'
      ? getRequiredFields()
      : ['username', 'firstName', 'lastName', 'password'];

    const missing = required.filter(
      (f) => !req.body || req.body[f] == null || String(req.body[f]).trim() === ''
    );
    if (missing.length) return badRequest(res, `Missing fields: ${missing.join(', ')}`);

    // Construct payload from required fields; preserve exact keys
    const userData = {};
    for (const f of required) userData[f] = req.body[f];

    // If an image was uploaded, store its served path
    if (req.file) {
      userData.image = `/uploads/${req.file.filename}`;
    }

    const user = await createUserService(userData);
    return createdWithLocation(res, `/api/users/${user._id}`);
  } catch (err) {
    return httpError(res, err);
  }
}

/**
 * Get a public-safe view of a user by database id.
 * Redacts private fields using the visibility filter.
 *
 * @param {import('express').Request} req - `params.id` is the user id.
 * @param {import('express').Response} res - Sends 200 with a filtered user object.
 * @returns {Promise<void>} Sends the HTTP response.
 * @throws Propagates lookup errors via httpError (e.g., not found -> service decides).
 */
async function getUserById(req, res) {
  try {
    const user = await findUserById(req.params.id);
    return ok(res, filterUserByVisibility(user, 'public'));
  } catch (err) {
    return httpError(res, err);
  }
}

/**
 * Get a public-safe view of a user by username.
 * Useful for profile pages that use usernames in routes.
 *
 * @param {import('express').Request} req - `params.username` is required.
 * @param {import('express').Response} res - Sends 200 with a filtered user object.
 * @returns {Promise<void>} Sends the HTTP response.
 * @throws Sends 400 for missing username; other errors via httpError.
 */
async function getUserByUsername(req, res) {
  const { username } = req.params;
  if (!username) return badRequest(res, 'Username is required');
  try {
    const user = await findUserByUsername(username);
    return ok(res, filterUserByVisibility(user, 'public'));
  } catch (err) {
    return httpError(res, err);
  }
}

/**
 * Update the current user’s profile, optionally replacing the image.
 * Accepts a partial body; service controls which fields are updatable.
 *
 * @param {import('express').Request} req - Uses `user.id` (or `user._id`), body patch, optional `file`.
 * @param {import('express').Response} res - Sends 204 on success with no body.
 * @returns {Promise<void>} Sends the HTTP response.
 * @throws Sends 400 if body missing or auth id missing; other errors via httpError.
 */
async function updateUserById(req, res) {
  if (!req.body) return badRequest(res, 'Request body is required');
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) return badRequest(res, 'Authenticated user id is missing');

    const patch = { ...req.body };
    if (req.file) {
      patch.image = `/uploads/${req.file.filename}`;
    }

    await updateUserByIdService(userId, patch);
    return noContent(res);
  } catch (err) {
    return httpError(res, err);
  }
}

module.exports = {
  createUser,
  getUserById,
  getUserByUsername,
  updateUserById,
};
