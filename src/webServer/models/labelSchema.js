const { createError } = require('../utils/error');
const userLabels = {}; // key = userId, value = array of labels [{ id, name }]

/**
 * Builds a label object after validating input.
 *
 * @param {object} name - The name of the label.
 * @param {number} id - The unique label ID for this user.
 * @returns {object} The constructed label object.
 * @throws {Error} If validation fails.
 */
function buildLabel(name, id) {
  if (!name) {
    throw createError('Label name is required', { type: 'VALIDATION', status: 400 });
  }
  return {
    id,
    name,
  };
}

/**
 * Checks whether a label with the given name already exists for the user.
 *
 * @param {number} userId - The ID of the user.
 * @param {string} name - The name of the label to check.
 * @returns {boolean} True if a label with the same name exists, false otherwise.
 */
function labelExistsForUser(userId, name) {
  const labels = userLabels[userId] || [];
  return labels.some(label => label.name === name);
}

/**
 * Adds a new label to the user's label list.
 *
 * @param {number} userId - The ID of the user.
 * @param {string} name - The name of the label to add.
 * @returns {object} The newly created label.
 * @throws {Error} If the label name already exists.
 */
function addLabelForUser(userId, name) {
  validateLabelName(name);

  // Init a label for user
  if (!userLabels[userId]) {
    userLabels[userId] = [];
  }

  if (labelExistsForUser(userId, name)) {
    throw createError('Label with this name already exists', { type: 'VALIDATION', status: 400 });
  }

  // Adding new label to the user
  const id = userLabels[userId].length + 1;
  const newLabel = buildLabel(name, id);
  userLabels[userId].push(newLabel);
  return newLabel;
}

/**
 * Gets all labels for a specific user.
 * @param {number} userId - The ID of the user.
 * @returns {Array} List of label objects. Empty if none exist.
 */
function getAllLabelsForUser(userId) {
  return userLabels[userId] || [];
}

/**
 * Fetches a label for a specific user by label ID.
 *
 * @param {number} userId - The ID of the user.
 * @param {number} labelId - The ID of the label.
 * @returns {object} The label object.
 * @throws {Error} If no label is found.
 */
function getLabelByUserAndId(userId, labelId) {
  const labels = userLabels[userId] || [];
  const label = labels.find(l => l.id === labelId);

  if (!label) {
    throw createError('Label not found', { type: 'NOT_FOUND', status: 404 });
  }

  return label;
}


/**
 * Validates that the label name is a non-empty string.
 * @param {any} name - The new label name to validate
 * @throws {Error} if the name is invalid
 */
function validateLabelName(name) {
  if (typeof name !== 'string' || name.trim() === '') {
    throw createError('Label name must be a non-empty string', {
      type: 'VALIDATION',
      status: 400
    });
  }
}

/**
 * Updates the name of a user's label.
 * @param {number} userId - ID of the user
 * @param {number} labelId - ID of the label to update
 * @param {string} newName - New name for the label
 * @returns {object} Updated label
 * @throws {Error} If label is not found or name is duplicate
 */
function updateLabelForUser(userId, labelId, newName) {
  validateLabelName(newName);

  // Gets user labels
  const labelList = userLabels[userId] || [];
  if (labelList.length === 0) {
    throw createError('This user does not have any labels', { type: 'NOT_FOUND', status: 404 });
  }

  // Search the label to change by id
  const label = labelList.find(l => l.id === labelId);
  if (!label) {
    throw createError('Label not found', { type: 'NOT_FOUND', status: 404 });
  }

  // Checks if name of label already taken
  const duplicate = labelList.find(l => l.name === newName && l.id !== labelId);
  if (duplicate) {
    throw createError('Label with this name already exists', { type: 'VALIDATION', status: 400 });
  }

  label.name = newName;
  return label;
}

/**
 * Deletes a label for a specific user by ID.
 *
 * @param {number} userId - The ID of the user.
 * @param {number} labelId - The ID of the label to delete.
 * @throws {Error} If the label is not found or user has no labels.
 */
function deleteLabelForUser(userId, labelId) {
  const labelList = userLabels[userId] || [];
  
  // Searches for label
  if (labelList.length === 0) {
    throw createError('This user does not have any labels', { type: 'NOT_FOUND', status: 404 });
  }
  const index = labelList.findIndex(l => l.id === labelId);
  if (index === -1) {
    throw createError('Label not found', { type: 'NOT_FOUND', status: 404 });
  }

  // Deletes label
  labelList.splice(index, 1);
}



module.exports = {
  buildLabel,
  labelExistsForUser,
  addLabelForUser,
  getAllLabelsForUser,
  getLabelByUserAndId,
  updateLabelForUser,
  deleteLabelForUser
};

