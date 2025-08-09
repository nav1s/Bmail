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

/** POST /api/users — minimal field checks; business logic in service */
async function createUser(req, res) {
  try {
    const required = typeof getRequiredFields === 'function'
      ? getRequiredFields()
      : ['username', 'firstName', 'lastName', 'password'];

    const missing = required.filter(
      (f) => !req.body || req.body[f] == null || String(req.body[f]).trim() === ''
    );
    if (missing.length) return badRequest(res, `Missing fields: ${missing.join(', ')}`);

    const userData = {};
    for (const f of required) userData[f] = req.body[f];

    const user = await createUserService(userData); // ← no image
    return createdWithLocation(res, `/api/users/${user._id}`);
  } catch (err) {
    return httpError(res, err);
  }
}

/** GET /api/users/:id — public-safe user */
async function getUserById(req, res) {
  try {
    const user = await findUserById(req.params.id);
    return ok(res, filterUserByVisibility(user, 'public'));
  } catch (err) {
    return httpError(res, err);
  }
}

/** GET /api/users/username/:username — public-safe user */
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

/** PATCH /api/users — auth required; body presence only */
async function updateUserById(req, res) {
  if (!req.body) return badRequest(res, 'Request body is required');
  try {
    await updateUserByIdService(req.user, req.body); // ← no image
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
