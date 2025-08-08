const { Label, SYSTEM_DEFAULT_LABELS } = require('../models/labelsModel');
const { createError } = require('../utils/error');

/**
 * Get all labels for a user.
 * @param {import('mongoose').Types.ObjectId|string} userId
 * @returns {Promise<import('../models/labelsModel').LabelDoc[]>}
 */
async function getLabelsForUser(userId) {
  try {
    return await Label.find({ userId }).lean();
  } catch (err) {
    throw err;
  }
}

/**
 * Get a label by its id.
 * @param {string} labelId
 * @returns {Promise<import('../models/labelsModel').LabelDoc>}
 */
async function getLabelById(labelId) {
  try {
    const label = await Label.findById(labelId).lean();
    if (!label) {
      throw createError('Label not found', { type: 'NOT_FOUND', status: 404 });
    }
    return label;
  } catch (err) {
    throw err;
  }
}

/**
 * Get a label by name.
 * @param {import('mongoose').Types.ObjectId|string} userId
 * @param {string} name
 * @returns {Promise<import('../models/labelsModel').LabelDoc>}
 */
async function getLabelByName(userId, name) {
  try {
    const label = await Label.findOne({ userId, name }).lean();
    if (!label) {
      throw createError('Label not found', { type: 'NOT_FOUND', status: 404 });
    }
    return label;
  } catch (err) {
    throw err;
  }
}

/**
 * Create a label.
 * @param {import('mongoose').Types.ObjectId|string} userId
 * @param {string} name
 * @param {boolean} [system=false]
 * @returns {Promise<import('../models/labelsModel').LabelDoc>}
 */
async function createLabel(userId, name, system = false) {
  try {
    const doc = await Label.create({ userId, name, system });
    return doc.toObject();
  } catch (err) {
    throw err;
  }
}


/** simple format validation; you can also keep this in controller if you prefer */
function validateLabelName(name) {
  if (typeof name !== 'string' || name.trim() === '') {
    throw createError('Label name must be a non-empty string', {
      type: 'VALIDATION',
      status: 400,
    });
  }
}

/**
 * Updates the name/system of a label.
 * - Validates name format
 * - Ensures label belongs to user
 * - Blocks updates to system/default labels
 * - Enforces per-user uniqueness
 */
async function updateLabelForUser(userId, labelId, newName) {
  try {
    validateLabelName(newName);

    // Find the label by both user + id to enforce ownership
    const label = await Label.findOne({ _id: labelId, userId });
    if (!label) {
      throw createError('Label not found', { type: 'NOT_FOUND', status: 404 });
    }

    // Block updates to system/default labels
    if (label.system === true || SYSTEM_DEFAULT_LABELS.includes(label.name.toLowerCase())) {
      throw createError('Cannot update default label', { type: 'VALIDATION', status: 400 });
    }

    // Per-user uniqueness check (case-insensitive)
    const duplicate = await Label.findOne({
      userId,
      name: { $regex: `^${newName}$`, $options: 'i' },
      _id: { $ne: labelId },
    }).lean();

    if (duplicate) {
      throw createError('Label with this name already exists', { type: 'VALIDATION', status: 400 });
    }

    label.name = newName.trim();
    await label.save();
    return label.toObject();
  } catch (err) {
    // Also handle unique index violations
    if (err && err.code === 11000) {
      throw createError('Label with this name already exists', { type: 'VALIDATION', status: 400 });
    }
    throw err;
  }
}

/**
 * Deletes a label for a specific user by ID.
 *
 * @param {import('mongoose').Types.ObjectId|string} userId - The ID of the user.
 * @param {import('mongoose').Types.ObjectId|string} labelId - The ID of the label to delete.
 * @returns {Promise<void>}
 * @throws {Error} If the label is not found or is a system/default label.
 */
async function deleteLabelForUser(userId, labelId) {
  try {
    // Find the label for this user
    const label = await Label.findOne({ _id: labelId, userId }).lean();
    if (!label) {
      throw createError('Label not found', { type: 'NOT_FOUND', status: 404 });
    }

    // Protect default/system labels
    if (label.system === true || SYSTEM_DEFAULT_LABELS.includes(label.name.toLowerCase())) {
      throw createError('Cannot delete default label', { type: 'VALIDATION', status: 400 });
    }

    // Delete
    await Label.deleteOne({ _id: labelId, userId });
  } catch (err) {
    throw err;
  }
}


/**
 * Ensure system default labels exist for a user.
 * Safe to call multiple times.
 * @param {import('mongoose').Types.ObjectId|string} userId
 * @returns {Promise<void>}
 */
async function ensureDefaultLabels(userId) {
  try {
    const existing = await Label.find({ userId }, { name: 1 }).lean();
    const existingNames = new Set(existing.map(l => l.name));
    const toCreate = SYSTEM_DEFAULT_LABELS.filter(n => !existingNames.has(n));

    if (toCreate.length === 0) return;

    const docs = toCreate.map(name => ({ userId, name, system: true }));
    await Label.insertMany(docs, { ordered: false }).catch(() => {});
  } catch (err) {
    throw err;
  }
}

module.exports = {
  getLabelsForUser,
  getLabelById,
  getLabelByName,
  createLabel,
  updateLabelForUser,
  deleteLabelForUser,
  ensureDefaultLabels
};
