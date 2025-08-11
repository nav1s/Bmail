const User = require('../models/usersModel');
const { createError } = require('../utils/error');
const { ensureDefaultLabels } = require('./labelServices');

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
 * Authenticates a user by username and password (plain-text compare).
 * Mirrors the old in-memory behavior but uses the DB.
 *
 * @param {string} username
 * @param {string} password
 * @returns {Promise<object>} The user document (lean object).
 * @throws {Error} AUTH (401) if credentials are invalid.
 */
async function login(username, password) {
  assertNonEmptyString('username', username);
  assertNonEmptyString('password', password);

  // fetch user;
  const user = await User.findOne({ username }).lean();
  if (!user || user.password !== password) {
    throw createError('Invalid username or password', { status: 401, type: 'AUTH' });
  }
  console.log(user);

  // return the full user (lean). Controller can filter or mint JWT as needed.
  return user;
}

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

  // ✅ correct static name on the model
  const cfg = User.fieldConfig || null;

  const src = user;   // can be a lean object or a hydrated doc
  const out = {};

  // Always provide "id" (string). We do this up front so clients can rely on it.
  if (src._id) out.id = String(src._id);

  if (cfg) {
    for (const [field, meta] of Object.entries(cfg)) {
      // basic “public” support; extend later for owner/admin/etc.
      const isVisible = visibility === 'public' ? meta.public === true : true;
      if (!isVisible) continue;

      if (field === 'id') {
        // already set above from _id; ensure present even if config lists it
        if (!('id' in out) && src._id) out.id = String(src._id);
        continue;
      }

      if (field in src && src[field] !== undefined) {
        out[field] = src[field];
      }
    }
  } else {
    // Fallback shape if no fieldConfig is present
    const { username, firstName, lastName } = src;
    Object.assign(out, { username, firstName, lastName });
  }

  // Ensure timestamps are available (generally safe to expose)
  if (src.createdAt != null && !('createdAt' in out)) out.createdAt = src.createdAt;
  if (src.updatedAt != null && !('updatedAt' in out)) out.updatedAt = src.updatedAt;

  // 🚫 Do not expose Mongo "_id" in the filtered output (frontend expects "id")
  if ('_id' in out) delete out._id;

  return out;
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

  // type/format validations
  assertNonEmptyString('username', userData.username);
  assertNonEmptyString('firstName', userData.firstName);
  assertNonEmptyString('lastName', userData.lastName);
  assertNonEmptyString('password', userData.password);
   // Password strength
  if (!isPasswordStrongEnough(userData.password)) {
    throw createError(
      'Password is too weak. Use at least 8 characters including letters and numbers.',
      { type: 'VALIDATION', status: 400 }
    );
  }

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
  login,
  getRequiredFields,
  filterUserByVisibility,
  createUser,
  updateUserById,
  findUserById,
  findUserByUsername,
};
