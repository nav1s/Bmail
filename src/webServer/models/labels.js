const { createError } = require('../utils/error');
const userLabels = {}; // key = userId, value = array of labels [{ id, name }]

const labelInputSchema = {
  name: { required: true, type: 'string' },
  id: { required: false, type: 'number' },
  mails: { required: false, type: 'array' }
};

const defaultLabelNames = Object.freeze({
  inbox: 'inbox',
  starred: 'starred',
  sent: 'sent',
  drafts: 'drafts',
  spam: 'spam',
  trash: 'trash'
});


let labelId = 1;

/**
 * @brief Creates default labels for a user if they do not already exist.
 * @param {number} userId - The ID of the user for whom to create default labels.
 */
function createDefaultLabels(userId) {

  // create user labels if they don't exist
  userLabels[userId] = userLabels[userId] || [];

  // create default labels if they don't exist
  Object.values(defaultLabelNames).forEach(name => {
    if (!labelExistsForUser(userId, name)) {
      const newLabel = buildLabel(name, labelId++);
      userLabels[userId].push(newLabel);
    }
  });

}
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

  const isDefault = Object.values(defaultLabelNames).includes(name.toLowerCase());

  // make sent and drafts non-attachable
  const isAttachable = name.toLowerCase() !== defaultLabelNames.sent
    && name.toLowerCase() !== defaultLabelNames.drafts;

  return {
    id,
    name,
    isDefault,
    isAttachable
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
  const id = labelId++;
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
 * @brief Gets a label by name for a specific user.
 * @param {*} userId - The ID of the user.
 * @param {*} name - The name of the label to retrieve.
 * @returns {object} The label object.
 */
function getLabelByName(userId, name) {
  const labels = userLabels[userId] || [];
  // log the user labels for debugging
  console.log(`User ${userId} labels:`, labels);
  const label = labels.find(l => l.name === name);

  if (!label) {
    throw createError('Label not found', { type: 'NOT_FOUND', status: 404 });
  }

  return label.id;
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

  // check if label is default
  if (Object.values(defaultLabelNames).includes(label.name)) {
    throw createError('Cannot update default label', { type: 'VALIDATION', status: 400 });
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

  // check if label is default
  if (Object.values(defaultLabelNames).includes(labelList[index].name)) {
    throw createError('Cannot delete default label', { type: 'VALIDATION', status: 400 });
  }

  // Deletes label
  labelList.splice(index, 1);
}

/** * Checks if a user can add a mail to a label.
 * @param {number} userId - The ID of the user.
 * @param {number} labelId - The ID of the label.
 * @param {number} mailId - The ID of the mail to be added
 * @throws {Error} If the label does not exist or the mail already exists in the label.
 */
function canUserAddMailToLabel(userId, labelId, mailId) {
  const labels = userLabels[userId] || [];
  const label = labels.find(l => l.id === labelId);
  // log the labels for debugging
  console.log(`User ${userId} labels:`, labels);
  console.log(`Looking for label with ID ${labelId}`);

  if (!label) {
    throw createError('Label not found', { type: 'NOT_FOUND', status: 404 });
  }

  // Check if the mail already exists in the label
  if (label.mails) {
    if (label.mails.includes(mailId)) {
      throw createError('Mail already exists in label', { type: 'VALIDATION', status: 400 });
    }
  }
  // check if label is attachable
  if (!label.isAttachable) {
    throw createError('Label is not attachable', { type: 'VALIDATION', status: 400 });
  }

  return true;

}
/**
 * @brief Adds a mail to a label for a specific user.
 * @param {*} userId the ID of the user
 * @param {*} labelId the ID of the label
 * @param {*} mailId  the ID of the mail to add to the label
 */
function addMailToLabel(mailId, labelId, userId) {
  console.log(`Adding mail ${mailId} to label ${labelId} for user ${userId}`);
  const labels = userLabels[userId] || [];
  console.log(`User ${userId} has labels:`, labels);
  console.log(`Looking for label with ID ${labelId}`);
  const label = labels.find(l => l.id === labelId);

  if (!label.mails) {
    label.mails = [];
  }

  label.mails.push(mailId);

  // Update the label in the user's labels
  const index = labels.findIndex(l => l.id === labelId);
  if (index !== -1) {
    labels[index] = label;
  } else {
    throw createError('Label not found during update', { type: 'NOT_FOUND', status: 404 });
  }

  userLabels[userId] = labels;
};

/**
 * @brief Removes a mail from a label for a specific user.
 * @param {*} userId the ID of the user
 * @param {*} labelId the ID of the label
 * @param {*} mailId  the ID of the mail to remove from the label
 */
function removeMailFromLabel(mailId, labelId, userId) {
  const labels = userLabels[userId] || [];
  const label = labels.find(l => l.id === labelId);

  if (!label) {
    throw createError('Label not found', { type: 'NOT_FOUND', status: 404 });
  }

  if (!label.mails || !label.mails.includes(mailId)) {
    throw createError('Mail not found in label', { type: 'NOT_FOUND', status: 404 });
  }

  // Remove the mail from the label
  label.mails = label.mails.filter(m => m !== mailId);

  // Update the label in the user's labels
  const index = labels.findIndex(l => l.id === labelId);
  if (index !== -1) {
    labels[index] = label;
  } else {
    throw createError('Label not found during update', { type: 'NOT_FOUND', status: 404 });
  }

  userLabels[userId] = labels;
}



module.exports = {
  buildLabel,
  labelExistsForUser,
  addLabelForUser,
  getAllLabelsForUser,
  getLabelByUserAndId,
  updateLabelForUser,
  deleteLabelForUser,
  createDefaultLabels,
  addMailToLabel,
  removeMailFromLabel,
  getLabelByName,
  defaultLabelNames,
  canUserAddMailToLabel,
};

