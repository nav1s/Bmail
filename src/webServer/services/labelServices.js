const { Label, SYSTEM_DEFAULT_LABELS } = require('../models/labelsModel');
const { createError } = require('../utils/error');
const { Types } = require('mongoose');
const { validateUserId } = require('./userServices');

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
    validateUserId(userId);
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
 * Validates ObjectId format and enforces ownership.
 *
 * @param {import('mongoose').Types.ObjectId|string} userId - The user's ID.
 * @param {string} labelId - The label's ObjectId string.
 * @returns {Promise<import('../models/labelsModel').LabelDoc>}
 * @throws {Error} 400 if id(s) are invalid, 404 if not found for this user.
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
    // Validate the user ID format
    validateUserId(userId);

    // Validate the label name format
    validateLabelName(name);

    // Block system names
    if (SYSTEM_DEFAULT_LABELS.includes(name.trim().toLowerCase())) {
      throw createError('Cannot create a label with a reserved system name', {
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
 * Updates the name of a custom label for a given user.
 * 
 * @param {string|ObjectId} userId - The ID of the user who owns the label.
 * @param {string|ObjectId} labelId - The label's ID.
 * @param {string} newName - The new label name.
 * @returns {Promise<Object>} Updated label document as plain object.
 * @throws {Error} If validation fails or label cannot be updated.
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

    // Prevent updating default/system labels
    if (label.system === true || SYSTEM_DEFAULT_LABELS.includes(label.name.toLowerCase())) {
      throw createError('Cannot update default label', { type: 'VALIDATION', status: 400 });
    }
    if (SYSTEM_DEFAULT_LABELS.includes(newName.trim().toLowerCase())) {
      throw createError('Cannot create a label with a reserved system name', {
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

    return label.toObject();
  } catch (err) {
    // Handle unique index violation errors
    if (err && err.code === 11000) {
      throw createError('Label with this name already exists', { type: 'VALIDATION', status: 400 });
    }
    throw err;
  }
}


/**
 * Deletes a label for a specific user by ID.
 * - Validates userId and labelId
 * - Ensures the label belongs to the user
 * - Blocks deletion of system/default labels
 *
 * @param {import('mongoose').Types.ObjectId|string} userId
 * @param {import('mongoose').Types.ObjectId|string} labelId
 * @returns {Promise<void>}
 * @throws {Error} 400 if IDs invalid, 404 if not found, 400 if system/default
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

    // Prevent deleting system/default labels
    if (label.system === true || SYSTEM_DEFAULT_LABELS.includes(label.name.toLowerCase())) {
      throw createError('Cannot delete default label', { type: 'VALIDATION', status: 400 });
    }

    // Perform deletion
    await Label.deleteOne({ _id: lId, userId: uId });
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

function validateLabelId(labelId) {
  if (!Types.ObjectId.isValid(labelId)) {
    throw createError('Label ID is invalid', { type: 'VALIDATION', status: 400 });
  }
  return new Types.ObjectId(labelId);
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
