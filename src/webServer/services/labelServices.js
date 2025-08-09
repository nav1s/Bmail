const { Label, SYSTEM_DEFAULT_LABELS } = require('../models/labelsModel');
const { createError } = require('../utils/error');

/**
 * Get labels for a user.
 * If `name` is provided, returns only that label (case-insensitive) or throws if not found.
 * Otherwise, returns all labels for the user.
 *
 * @param {import('mongoose').Types.ObjectId|string} userId - The user's ID.
 * @param {string} [name = null] - Optional label name to filter by.
 * @returns {Promise<import('../models/labelsModel').LabelDoc[]>}
 */
async function getLabelsForUser(userId, name = null) {
  try {
    const query = { userId };

    if (name !== null) {
      query.name = { $regex: `^${name}$`, $options: 'i' }; // case-insensitive exact match
      const label = await Label.findOne(query).lean();
      if (!label) {
        throw createError('Label not found', { type: 'NOT_FOUND', status: 404 });
      }
      return [label];
    }

    return await Label.find(query).lean();
  } catch (err) {
    throw err;
  }
}



/**
 * Get a label by its id for a specific user.
 *
 * @param {string} labelId - The label's ObjectId string.
 * @param {import('mongoose').Types.ObjectId|string} userId - The user's ID.
 * @returns {Promise<import('../models/labelsModel').LabelDoc>}
 * @throws {Error} If label is not found for this user.
 */
async function getLabelForUserById(userId, labelId) {
  try {
    const label = await Label.findOne({ _id: labelId, userId }).lean();
    if (!label) {
      throw createError('Label not found', { type: 'NOT_FOUND', status: 404 });
    }
    return label;
  } catch (err) {
    throw err;
  }
}


/**
 * Adds a new label for a given user.
 * @param {import('mongoose').Types.ObjectId|string} userId - The user's ID.
 * @param {string} name - The label's name.
 * @param {boolean} [system=false] - Whether this is a system label.
 * @param {boolean} [attachable=true] - Whether this label can be manually attached/removed.
 * @returns {Promise<import('../models/labelsModel').LabelDoc>} The created label document.
 * @throws {Error} If the label name already exists or is invalid.
 */
async function addLabelForUser(userId, name, system = false, attachable = true) {
  try {
    // Validate the label name format
    validateLabelName(name);

    // Check for duplicate name for this user (case-insensitive)
    const duplicate = await Label.findOne({
      userId,
      name: { $regex: `^${name}$`, $options: 'i' }
    }).lean();

    if (duplicate) {
      throw createError('Label with this name already exists', {
        type: 'VALIDATION',
        status: 400
      });
    }

    // Create and save label
    const doc = await Label.create({ userId, name, system, attachable });
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
    const existingNames = new Set(existing.map(l => l.name.toLowerCase()));
    const toCreate = SYSTEM_DEFAULT_LABELS.filter(n => !existingNames.has(n));

    if (toCreate.length === 0) return;

    const docs = toCreate.map(name => ({
      userId,
      name,
      system: true,
      attachable: !['sent', 'drafts'].includes(name.toLowerCase()),
    }));

    await Label.insertMany(docs, { ordered: false }).catch(() => {});
  } catch (err) {
    throw err;
  }
}

/**
 * Get a label's id by name (case-insensitive) for a user.
 * Keeps your existing "single name lookup" behavior.
 * @param {import('mongoose').Types.ObjectId|string} userId
 * @param {string} name
 * @returns {Promise<string>} label id as string
 * @throws 404 if not found
 */
async function getLabelIdByName(userId, name) {
  const [label] = await getLabelsForUser(userId, name); // throws 404 if not found (unchanged behavior)
  return String(label._id);
}

/**
 * Get a system label id by name: 'inbox' | 'sent' | 'drafts' | 'spam' | 'trash' | 'starred'
 * Ensures defaults exist first.
 * @param {import('mongoose').Types.ObjectId|string} userId
 * @param {string} systemName
 * @returns {Promise<string>}
 */
async function getSystemLabelId(userId, systemName) {
  await ensureDefaultLabels(userId);
  return getLabelIdByName(userId, systemName);
}




module.exports = {
  getLabelsForUser,
  getLabelForUserById,
  addLabelForUser,
  updateLabelForUser,
  deleteLabelForUser,
  ensureDefaultLabels,
  getSystemLabelId
};
