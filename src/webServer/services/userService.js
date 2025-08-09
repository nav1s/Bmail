const User = require('../models/usersModel');
const { createError } = require('../utils/error');
const { ensureDefaultLabels } = require('./labelServices');

/**
 * Get the list of required fields for user creation.
 * Reads from the model's fieldConfig (`required: true`) with a safe fallback.
 * @returns {string[]} Array of required field names.
 */
function getRequiredFields() {
  const cfg = User.fieldConfig || null;
  if (!cfg) return ['username', 'firstName', 'lastName', 'password'];
  return Object.entries(cfg)
    .filter(([, meta]) => meta && meta.required === true)
    .map(([name]) => name);
}

/**
 * Create a public-safe DTO by projecting only fields marked `public: true`
 *
 * @param {object} user - A mongoose user document or plain object.
 * @param {'public'} [visibility='public'] - Visibility level (future extension).
 * @throws {Error} NOT_FOUND when `user` is falsy.
 * @returns {object} Public-safe user projection.
 */
function filterUserByVisibility(user, visibility = 'public') {
  if (!user) {
    throw createError('User not found', { status: 404, type: 'NOT_FOUND' });
  }

  const cfg = User.fieldConfig || null;
  const filteredUser = {};

  if (cfg) {
    for (const [field, meta] of Object.entries(cfg)) {
      // basic “public” support; extend later for owner/admin/etc.
      const isVisible = visibility === 'public' ? meta.public === true : true;
      if (!isVisible) continue;

      // support a virtual "id" that maps to _id
      const value = field === 'id' ? user._id : user[field];
      if (value !== undefined) {
        if (field === 'id') filteredUser._id = value;
        else filteredUser[field] = value;
      }
    }
  } else {
    // Fallback shape if no fieldConfig is present
    const { _id, username, firstName, lastName } = user;
    Object.assign(filteredUser, { _id, username, firstName, lastName });
  }

  // Ensure timestamps are available (generally safe to expose)
  if (user.createdAt && !('createdAt' in filteredUser)) filteredUser.createdAt = user.createdAt;
  if (user.updatedAt && !('updatedAt' in filteredUser)) filteredUser.updatedAt = user.updatedAt;

  return filteredUser;
}

/**
 * Ensure a value is a non-empty string (labels-style validation).
 * @param {string} field - Logical field name (for the error message).
 * @param {any} value - Value to validate.
 * @throws {Error} VALIDATION when value is not a non-empty trimmed string.
 */
function assertNonEmptyString(field, value) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw createError(`${field} must be a non-empty string`, {
      type: 'VALIDATION',
      status: 400,
    });
  }
}

/* ------------------------------ service ---------------------------- */

/**
 * Create a new user document.
 *
 * @param {object} userData - Input payload (already minimally validated in controller).
 * @returns {Promise<object>} Created user as a plain object.
 * @throws {Error} VALIDATION for missing/invalid fields, DUPLICATE for taken username.
 */
async function createUser(userData) {
  // presence check (already done in controller, but we re-check)
  for (const f of getRequiredFields()) {
    if (!userData || userData[f] == null || String(userData[f]).trim() === '') {
      throw createError(`Missing required field: ${f}`, { type: 'VALIDATION', status: 400 });
    }
  }

  // type/format validations (adjust as you like)
  assertNonEmptyString('username', userData.username);
  assertNonEmptyString('firstName', userData.firstName);
  assertNonEmptyString('lastName', userData.lastName);
  assertNonEmptyString('password', userData.password); // strength checks can live in a separate helper

  // uniqueness (case-sensitive as before)
  const existing = await User.findOne({ username: userData.username }).lean();
  if (existing) {
    throw createError('Username already exists', { type: 'DUPLICATE', status: 400 });
  }

  const user = await User.create(userData);
  await ensureDefaultLabels(user._id);
  return user.toObject();
}

/**
 * Update an existing user document.
 *
 * @param {string|import('mongoose').Types.ObjectId} userId - The user id to update.
 * @param {object} patch - Partial user fields to update.
 * @returns {Promise<object>} Updated user as a plain object.
 * @throws {Error} VALIDATION for bad values, NOT_FOUND when user is missing.
 */
async function updateUserById(userId, patch) {
  const user = await User.findById(userId);
  if (!user) throw createError('User not found', { type: 'NOT_FOUND', status: 404 });

  // If you have fieldConfig.editable flags, enforce them here
  const cfg = User.fieldConfig || {};
  const applyIfAllowed = (key, val) => {
    const meta = cfg[key];
    if (meta && meta.editable === false) return; // skip non-editable
    user[key] = val;
  };

  if (patch.firstName != null) {
    assertNonEmptyString('firstName', patch.firstName);
    applyIfAllowed('firstName', String(patch.firstName));
  }

  if (patch.lastName != null) {
    assertNonEmptyString('lastName', patch.lastName);
    applyIfAllowed('lastName', String(patch.lastName));
  }

  // NOTE: password changes should use a dedicated flow (old password check + hashing)

  await user.save();
  return user.toObject();
}

/**
 * Find a user by id (lean).
 * @param {string|import('mongoose').Types.ObjectId} id - The user id.
 * @returns {Promise<object>} The user as a plain object.
 * @throws {Error} NOT_FOUND when the user does not exist.
 */
async function findUserById(id) {
  const doc = await User.findById(id).lean();
  if (!doc) throw createError('User not found', { status: 404 });
  return doc;
}

/**
 * Find a user by username (lean).
 * @param {string} username - Username to look up.
 * @returns {Promise<object>} The user as a plain object.
 * @throws {Error} NOT_FOUND when the user does not exist.
 */
async function findUserByUsername(username) {
  const doc = await User.findOne({ username }).lean();
  if (!doc) throw createError('User not found', { status: 404 });
  return doc;
}

module.exports = {
  getRequiredFields,
  filterUserByVisibility,
  createUser,
  updateUserById,
  findUserById,
  findUserByUsername,
};
