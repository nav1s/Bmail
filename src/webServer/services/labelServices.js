const { Label, DEFAULT_LABELS } = require('../models/labelsModel');
const { createError } = require('../utils/error');
const { Types } = require('mongoose');
const { canUserAccessMail, tagMailsWithUrlsAsSpam } = require('./mailServices');
const { addUrlsToBlacklist } = require('./blacklistService');
const Mail = require('../models/mailsModel'); // ← needed for attach/detach mail label operations

/**
 * Convert a Label doc/plain object to a simple DTO with `id` instead of `_id`.
 * Keeps the rest of the fields as-is.
 *
 * @param {object} doc - Mongoose document or plain object.
 * @returns {object|null} DTO with `id` or null if falsy input.
 */
function toLabelDTO(doc) {
  if (!doc) return doc;
  // Works for Mongoose docs and plain objects
  const obj = typeof doc.toObject === 'function' ? doc.toObject() : doc;
  const { _id, ...rest } = obj;
  return { id: String(_id), ...rest };
}

/**
 * Validate a MongoDB ObjectId and return a normalized Types.ObjectId.
 * Throws a 400 error if invalid.
 *
 * @param {string|import('mongoose').Types.ObjectId} id - Candidate id.
 * @returns {import('mongoose').Types.ObjectId} Safe ObjectId instance.
 * @throws {Error} VALIDATION (400) if invalid.
 */
function validateUserId(id) {
  if (!Types.ObjectId.isValid(id)) {
    throw createError('User ID is invalid', { type: 'VALIDATION', status: 400 });
  }
  return new Types.ObjectId(id);
}

/**
 * Fetch labels for a user; optionally look up a single name (case-insensitive).
 * Returns DTOs; name lookup throws 404 if not found.
 *
 * @param {string|import('mongoose').Types.ObjectId} userId - Owner id.
 * @param {string|null} [name=null] - Specific label name to match exactly (i).
 * @returns {Promise<object[]>} Array of label DTOs.
 * @throws {Error} VALIDATION (400) for bad ids; NOT_FOUND (404) if name not found.
 */
async function getLabelsForUser(userId, name = null) {
  try {
    validateUserId(userId);
    const query = { userId };

    if (name !== null) {
      query.name = { $regex: `^${name}$`, $options: 'i' }; // case-insensitive exact match
      const label = await Label.findOne(query).lean();
      if (!label) {
        throw createError('Label not found', { type: 'NOT_FOUND', status: 404 });
      }
      // Ensure DTO shape with `id` instead of `_id`
      return [toLabelDTO(label)];
    }

    const rows = await Label.find({ userId }).lean();
    return rows.map(toLabelDTO);

  } catch (err) {
    throw err;
  }
}

/**
 * Get a specific label by id and user ownership.
 * Uses lean query + DTO shape.
 *
 * @param {string|import('mongoose').Types.ObjectId} userId - Owner id.
 * @param {string} labelId - Label ObjectId string.
 * @returns {Promise<object>} The label DTO.
 * @throws {Error} VALIDATION (400) for bad ids; NOT_FOUND (404) if missing.
 */
async function getLabelForUserById(userId, labelId) {
  try {
    // Validate both IDs
    validateUserId(userId);
    if (!Types.ObjectId.isValid(labelId)) {
      throw createError('Label ID is invalid', { type: 'VALIDATION', status: 400 });
    }

    const label = await Label.findOne({
      _id: new Types.ObjectId(labelId),
      userId: new Types.ObjectId(userId),
    }).lean();

    if (!label) {
      throw createError('Label not found', { type: 'NOT_FOUND', status: 404 });
    }

    // Return DTO so callers see `id`
    return toLabelDTO(label);
  } catch (err) {
    throw err;
  }
}

/**
 * Create a new custom (non-default) label for a user.
 * Enforces name validity and duplicate checks.
 *
 * @param {string|import('mongoose').Types.ObjectId} userId - Owner id.
 * @param {string} name - New label name.
 * @param {boolean} [isDefault=false] - Whether label is a system default.
 * @param {boolean} [isAttachable=true] - Whether users can attach/detach it.
 * @returns {Promise<object>} Created label DTO.
 * @throws {Error} VALIDATION (400) for reserved/invalid/duplicate names.
 */
async function addLabelForUser(userId, name, isDefault = false, isAttachable = true) {
  try {
    // Validate the user ID format
    validateUserId(userId);

    // Validate the label name format
    validateLabelName(name);

    // Block isDefault names
    if (DEFAULT_LABELS.includes(name.trim().toLowerCase())) {
      throw createError('Cannot create a label with a reserved isDefault name', {
        type: 'VALIDATION', status: 400
      });
    }

    // Check for duplicate name for this user (case-insensitive)
    const duplicate = await Label.findOne({
      userId,
      name: { $regex: `^${name}$`, $options: 'i' },
    }).lean();

    if (duplicate) {
      throw createError('Label with this name already exists', {
        type: 'VALIDATION',
        status: 400,
      });
    }

    // Create and save label
    const doc = await Label.create({ userId, name, isDefault, isAttachable });
    // Return DTO so clients have `id`
    return toLabelDTO(doc);
  } catch (err) {
    throw err;
  }
}

/**
 * Quick label name validator used by add/update.
 * Only checks non-empty trimmed string.
 *
 * @param {string} name - Proposed label name.
 * @throws {Error} VALIDATION (400) for empty/invalid name.
 */
function validateLabelName(name) {
  if (typeof name !== 'string' || name.trim() === '') {
    throw createError('Label name must be a non-empty string', {
      type: 'VALIDATION',
      status: 400,
    });
  }
}

/**
 * Update a non-default label’s name.
 * Prevents renaming into a reserved default name or duplicates.
 *
 * @param {string|import('mongoose').Types.ObjectId} userId - Owner id.
 * @param {string|import('mongoose').Types.ObjectId} labelId - Label id.
 * @param {string} newName - New label name.
 * @returns {Promise<object>} Updated label DTO.
 * @throws {Error} VALIDATION (400), NOT_FOUND (404), DUPLICATE (11000) mapped to VALIDATION.
 */
async function updateLabelForUser(userId, labelId, newName) {
  try {
    // Validate IDs
    validateUserId(userId);
    validateLabelId(labelId);

    // Validate new name format
    validateLabelName(newName);

    // Find the label by user and ID
    const label = await Label.findOne({ _id: labelId, userId });
    if (!label) {
      throw createError('Label not found', { type: 'NOT_FOUND', status: 404 });
    }

    // Prevent updating default/isDefault labels
    if (label.isDefault === true || DEFAULT_LABELS.includes(label.name.toLowerCase())) {
      throw createError('Cannot update default label', { type: 'VALIDATION', status: 400 });
    }
    if (DEFAULT_LABELS.includes(newName.trim().toLowerCase())) {
      throw createError('Cannot create a label with a reserved isDefault name', {
        type: 'VALIDATION',
        status: 400
      });
    }

    // Check for duplicates in this user's labels (case-insensitive)
    const duplicate = await Label.findOne({
      userId,
      name: { $regex: `^${newName}$`, $options: 'i' },
      _id: { $ne: labelId },
    }).lean();

    if (duplicate) {
      throw createError('Label with this name already exists', {
        type: 'VALIDATION',
        status: 400
      });
    }

    // Update and save
    label.name = newName.trim();
    await label.save();

    // Return DTO so clients have `id`
    return toLabelDTO(label);
  } catch (err) {
    // Handle unique index violation errors
    if (err && err.code === 11000) {
      throw createError('Label with this name already exists', { type: 'VALIDATION', status: 400 });
    }
    throw err;
  }
}

/**
 * Delete a custom (non-default) label owned by a user.
 * Hard-deletes the label document after checks.
 *
 * @param {string|import('mongoose').Types.ObjectId} userId - Owner id.
 * @param {string|import('mongoose').Types.ObjectId} labelId - Label id.
 * @returns {Promise<void>} No content on success.
 * @throws {Error} VALIDATION (400), NOT_FOUND (404), VALIDATION (400) for default labels.
 */
async function deleteLabelForUser(userId, labelId) {
  try {
    validateUserId(userId);
    validateLabelId(labelId);

    const uId = new Types.ObjectId(userId);
    const lId = new Types.ObjectId(labelId);

    // Ensure the label exists and is owned by the user
    const label = await Label.findOne({ _id: lId, userId: uId }).lean();
    if (!label) {
      throw createError('Label not found', { type: 'NOT_FOUND', status: 404 });
    }

    // Prevent deleting default labels
    if (label.isDefault === true || DEFAULT_LABELS.includes(label.name.toLowerCase())) {
      throw createError('Cannot delete default label', { type: 'VALIDATION', status: 400 });
    }

    // Perform deletion
    await Label.deleteOne({ _id: lId, userId: uId });
  } catch (err) {
    throw err;
  }
}

/**
 * Ensure all default labels exist for the user.
 * Idempotent: safe to call multiple times.
 *
 * @param {string|import('mongoose').Types.ObjectId} userId - Owner id.
 * @returns {Promise<void>} Nothing on success.
 * @throws {Error} DB errors bubble up.
 */
async function ensureDefaultLabels(userId) {
  try {
    const existing = await Label.find({ userId }, { name: 1 }).lean();
    const existingNames = new Set(existing.map(l => l.name.toLowerCase()));
    const toCreate = DEFAULT_LABELS.filter(n => !existingNames.has(n));

    if (toCreate.length === 0) return;

    const docs = toCreate.map(name => ({
      userId,
      name,
      isDefault: true,
      isAttachable: !['sent', 'drafts'].includes(name.toLowerCase()),
    }));

    await Label.insertMany(docs, { ordered: false }).catch(() => {});
  } catch (err) {
    throw err;
  }
}

/**
 * Resolve a label id by name (case-insensitive) for a user.
 * Delegates to getLabelsForUser(name) which throws 404 when absent.
 *
 * @param {string|import('mongoose').Types.ObjectId} userId - Owner id.
 * @param {string} name - Label name.
 * @returns {Promise<string>} Label id as a string.
 * @throws {Error} NOT_FOUND (404) if name not found.
 */
async function getLabelIdByName(userId, name) {
  const [label] = await getLabelsForUser(userId, name); // throws 404 if not found (unchanged behavior)
  // getLabelsForUser returns DTO(s), so use `id`
  return String(label.id);
}

/**
 * Get a default label id by reserved name.
 * Ensures defaults exist, then resolves the id.
 *
 * @param {string|import('mongoose').Types.ObjectId} userId - Owner id.
 * @param {string} isDefaultName - One of 'inbox'|'sent'|'drafts'|'spam'|'trash'|'starred'.
 * @returns {Promise<string>} Label id string.
 * @throws {Error} DB errors bubble up.
 */
async function getisDefaultLabelId(userId, isDefaultName) {
  await ensureDefaultLabels(userId);
  return getLabelIdByName(userId, isDefaultName);
}

/**
 * Validate a label id string.
 * Throws on invalid values; returns a Types.ObjectId for convenience.
 *
 * @param {string} labelId - Candidate ObjectId string.
 * @returns {import('mongoose').Types.ObjectId} Normalized id.
 * @throws {Error} VALIDATION (400) when invalid.
 */
function validateLabelId(labelId) {
  if (!Types.ObjectId.isValid(labelId)) {
    throw createError('Label ID is invalid', { type: 'VALIDATION', status: 400 });
  }
  return new Types.ObjectId(labelId);
}

/**
 * Attach a label to a mail the user can see.
 * If the label is Spam, also: add URLs to bloom and auto-tag matching mails.
 *
 * @param {string} mailId - Mail ObjectId string.
 * @param {string} labelId - Label ObjectId string.
 * @param {string} username - Actor username (access check).
 * @param {string|import('mongoose').Types.ObjectId} userId - Owner of Spam label.
 * @returns {Promise<object>} Updated mail DTO (public fields only).
 * @throws {Error} VALIDATION (400), NOT_FOUND (404), FORBIDDEN (403).
 */
async function attachLabelToMail(mailId, labelId, username, userId) {
  if (!Types.ObjectId.isValid(mailId) || !Types.ObjectId.isValid(labelId)) {
    throw createError('IDs must be valid ObjectIds', { type: 'VALIDATION', status: 400 });
  }

  const mail = await Mail.findById(mailId);
  if (!mail) throw createError('Mail not found', { type: 'NOT_FOUND', status: 404 });
  if (!canUserAccessMail(mail, username)) {
    throw createError('User does not have access to this mail', { status: 403 });
  }

  const lId = new Types.ObjectId(labelId);
  if (!mail.labels.map(String).includes(String(lId))) {
    mail.labels.push(lId);
    await mail.save();
  }

  const spamLabelId = await getisDefaultLabelId(userId, 'spam');
  if (String(spamLabelId) === String(labelId)) {
    const norms = (mail.urls || []).map(u => u?.trim().toLowerCase().replace(/\/$/, '')).filter(Boolean);
    if (norms.length) {
      await addUrlsToBlacklist(norms);
      await tagMailsWithUrlsAsSpam(userId, username, norms, spamLabelId);
    }
  }

  // return safe DTO inline
  const out = {};
  const paths = Mail.schema.paths;
  Object.keys(paths).forEach((path) => {
    if (paths[path].options && paths[path].options.public) {
      const key = path === '_id' ? 'id' : path;
      out[key] = path === '_id' ? String(mail._id) : mail[path];
    }
  });
  if (out.labels && Array.isArray(out.labels)) out.labels = out.labels.map((l) => String(l));
  return out;
}

/**
 * Detach a label from a mail (idempotent) after access checks.
 * No extra propagation on removal.
 *
 * @param {string} mailId - Mail id string.
 * @param {string} labelId - Label id string.
 * @param {string} username - Actor username.
 * @returns {Promise<object>} Updated mail DTO (public fields only).
 * @throws {Error} VALIDATION (400), NOT_FOUND (404), FORBIDDEN (403).
 */
async function detachLabelFromMail(mailId, labelId, username) {
  if (!Types.ObjectId.isValid(mailId) || !Types.ObjectId.isValid(labelId)) {
    throw createError('IDs must be valid ObjectIds', { type: 'VALIDATION', status: 400 });
  }

  const mail = await Mail.findById(mailId);
  if (!mail) throw createError('Mail not found', { type: 'NOT_FOUND', status: 404 });
  if (!canUserAccessMail(mail, username)) {
    throw createError('User does not have access to this mail', { status: 403 });
  }

  const lId = String(labelId);
  mail.labels = (mail.labels || []).filter((id) => String(id) !== lId);
  await mail.save();

  const out = {};
  const paths = Mail.schema.paths;
  Object.keys(paths).forEach((path) => {
    if (paths[path].options && paths[path].options.public) {
      const key = path === '_id' ? 'id' : path;
      out[key] = path === '_id' ? String(mail._id) : mail[path];
    }
  });
  if (out.labels && Array.isArray(out.labels)) out.labels = out.labels.map((l) => String(l));
  return out;
}

module.exports = {
  getLabelsForUser,
  getLabelForUserById,
  addLabelForUser,
  updateLabelForUser,
  deleteLabelForUser,
  ensureDefaultLabels,
  getisDefaultLabelId,
  getLabelIdByName,
  attachLabelToMail,
  detachLabelFromMail
};
