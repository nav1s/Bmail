const User = require('../models/usersModel');
const { createError } = require('../utils/error');
const { ensureDefaultLabels } = require('./labelServices');

/**
 * Check if a password meets basic strength requirements.
 * Requires min 8 chars, with uppercase, lowercase, digit, and special char.
 *
 * @param {string} password - Password string to validate.
 * @returns {boolean} True if strong enough, false if not.
 */
isPasswordStrongEnough = (password) => {
  if (password.length < 8) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/\d/.test(password)) return false;
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return false;

  return true;
};

/**
 * Authenticate a user with username and password (plain-text compare).
 * Looks up the DB and returns the user object if valid.
 *
 * @param {string} username - User’s login name.
 * @param {string} password - User’s password (plain text).
 * @returns {Promise<object>} The user object from DB (lean).
 * @throws {Error} AUTH (401) if username or password is invalid.
 */
async function login(username, password) {
  assertNonEmptyString('username', username);
  assertNonEmptyString('password', password);

  const user = await User.findOne({ username }).lean();
  if (!user || user.password !== password) {
    throw createError('Invalid username or password', { status: 401, type: 'AUTH' });
  }
  console.log(user);

  return user;
}

/**
 * Get list of required fields for creating a user.
 * Reads from model config, falls back to defaults if missing.
 *
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
 * Create a safe public version of a user object.
 * Keeps only fields marked as public in config.
 *
 * @param {object} user - A user document or plain object.
 * @param {'public'} [visibility='public'] - Visibility level (default: public).
 * @returns {object} A filtered user object safe to send to clients.
 * @throws {Error} NOT_FOUND if user is null/undefined.
 */
function filterUserByVisibility(user, visibility = 'public') {
  if (!user) {
    throw createError('User not found', { status: 404, type: 'NOT_FOUND' });
  }

  const cfg = User.fieldConfig || null;
  const src = user;
  const out = {};

  if (src._id) out.id = String(src._id);

  if (cfg) {
    for (const [field, meta] of Object.entries(cfg)) {
      const isVisible = visibility === 'public' ? meta.public === true : true;
      if (!isVisible) continue;

      if (field === 'id') {
        if (!('id' in out) && src._id) out.id = String(src._id);
        continue;
      }

      if (field in src && src[field] !== undefined) {
        out[field] = src[field];
      }
    }
  } else {
    const { username, firstName, lastName } = src;
    Object.assign(out, { username, firstName, lastName });
  }

  if (src.createdAt != null && !('createdAt' in out)) out.createdAt = src.createdAt;
  if (src.updatedAt != null && !('updatedAt' in out)) out.updatedAt = src.updatedAt;

  if ('_id' in out) delete out._id;

  return out;
}

/**
 * Ensure a value is a non-empty string.
 * Throws if input is invalid.
 *
 * @param {string} field - Logical field name (used in error message).
 * @param {any} value - Value to check.
 * @throws {Error} VALIDATION if not a non-empty trimmed string.
 */
function assertNonEmptyString(field, value) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw createError(`${field} must be a non-empty string`, {
      type: 'VALIDATION',
      status: 400,
    });
  }
}
/**
 * Create a new user record in the database.
 * Validates fields, checks duplicates, enforces strong password.
 *
 * @param {object} userData - Input object with user fields.
 * @returns {Promise<object>} The newly created user as a plain object.
 * @throws {Error} VALIDATION if fields are missing/invalid.
 * @throws {Error} DUPLICATE if username already exists.
 */
async function createUser(userData) {
  for (const f of getRequiredFields()) {
    if (!userData || userData[f] == null || String(userData[f]).trim() === '') {
      throw createError(`Missing required field: ${f}`, { type: 'VALIDATION', status: 400 });
    }
  }

  assertNonEmptyString('username', userData.username);
  assertNonEmptyString('firstName', userData.firstName);
  assertNonEmptyString('lastName', userData.lastName);
  assertNonEmptyString('password', userData.password);

  if (!isPasswordStrongEnough(userData.password)) {
    throw createError(
      'Password is too weak. Use at least 8 characters including letters and numbers.',
      { type: 'VALIDATION', status: 400 }
    );
  }

  const existing = await User.findOne({ username: userData.username }).lean();
  if (existing) {
    throw createError('Username already exists', { type: 'DUPLICATE', status: 400 });
  }

  const user = await User.create(userData);
  await ensureDefaultLabels(user._id);
  return user.toObject();
}

/**
 * Update an existing user by ID.
 * Supports firstName, lastName, and image updates.
 *
 * @param {string|import('mongoose').Types.ObjectId} userId - The user’s ID.
 * @param {object} patch - Partial object with fields to update.
 * @returns {Promise<object>} The updated user as a plain object.
 * @throws {Error} NOT_FOUND if user does not exist.
 * @throws {Error} VALIDATION if input values are invalid.
 */
async function updateUserById(userId, patch) {
  const user = await User.findById(userId);
  if (!user) throw createError('User not found', { type: 'NOT_FOUND', status: 404 });

  const cfg = User.fieldConfig || {};
  const applyIfAllowed = (key, val) => {
    const meta = cfg[key];
    if (meta && meta.editable === false) return;
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

  if (patch.image != null) {
    if (typeof patch.image !== 'string' || !patch.image.trim()) {
      throw createError('image must be a non-empty string path', { type: 'VALIDATION', status: 400 });
    }
    applyIfAllowed('image', patch.image.trim());
  }

  await user.save();
  return user.toObject();
}

/**
 * Find a user by ID.
 *
 * @param {string|import('mongoose').Types.ObjectId} id - User’s ID.
 * @returns {Promise<object>} The user object.
 * @throws {Error} NOT_FOUND if no user exists with this ID.
 */
async function findUserById(id) {
  const doc = await User.findById(id).lean();
  if (!doc) throw createError('User not found', { status: 404 });
  return doc;
}

/**
 * Find a user by username.
 *
 * @param {string} username - Username to search for.
 * @returns {Promise<object>} The user object.
 * @throws {Error} NOT_FOUND if username does not exist.
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
