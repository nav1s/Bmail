const { createError } = require('../utils/error');

const mails = []; // [{ id, from, to[], title, body, timestamp, labels: [], deletedBySender: false, deletedByRecipient: [] }]
let mailIdCounter = 1;

/**
 * Schema for newMail input fields.
 * - Contains only fields the user must provide
 * - `normalize: true` indicates value should be wrapped in an array
 *
 * Internal fields like `id` and `timestamp` are handled separately
 * in the buildMail() function and are not part of this schema.
 */
const mailInputSchema = {
  from: { public: true, required: true },
  to: { public: true, normalize: true, required: true },
  title: { public: true, required: true },
  body: { public: true, required: true },
  draft: { public: true, default: false, required: false },
  labels: { public: true, default: [], required: false },
  urls: {public: true, default: [], required: false },
  deletedBySender: { public: false, default: false, required: false },
  deletedByRecipient: { public: false, default: [], required: false }
};

/**
 * Validates input fields against the schema.
 * - Ensures all required fields are present
 * - Rejects any unknown fields not defined in the schema
 *
 * @param {object} input - Raw user input (e.g. from req.body)
 * @returns {{ success: true } | { success: false, error: string }}
 */
function validateMailInput(input) {
  // Parses fields from keys
  const requiredFields = Object.keys(mailInputSchema);
  const inputFields = Object.keys(input);
  // log the mail input schema and input for debugging
  console.log('Mail input schema:', mailInputSchema);

  // add default values for fields that aren't required and not in the input
  for (const field of Object.keys(mailInputSchema)) {
    if (!(field in input) && !mailInputSchema[field].required) {
      // check if the default value is an array
      if (Array.isArray(mailInputSchema[field].default)) {
        input[field] = [...mailInputSchema[field].default];
        continue;
      }
      input[field] = mailInputSchema[field].default;
    }
  }

  // Filtering fields from input
  const missing = requiredFields.filter(field => !(field in input));
  const unknown = inputFields.filter(field => !requiredFields.includes(field));

  // checks if there are any missing or extra fields
  if (missing.length > 0) {
    throw createError(`Missing fields: ${missing.join(', ')}`, { status: 400, type: 'VALIDATION' });
  }
  if (unknown.length > 0) {
    throw createError(`Unknown fields: ${unknown.join(', ')}`, { status: 400, type: 'VALIDATION' });
  }

  return true;
}

/**
 * Constructs a validated newMail object using the schema.
 * - Validates input against the config
 * - Injects internal fields like `id` and `timestamp`
 * - Normalizes specific fields (e.g. wraps `to` in an array)
 *
 * @param {object} input - Raw newMail input from client
 * @param {number} id - Generated newMail ID to assign
 * @returns {{ success: true, newMail: object } | { success: false, error: string }}
 */
function buildMail(input) {
  const newMail = {
    id: mailIdCounter++,
    timestamp: new Date().toISOString(),
    deletedBySender: false,
    deletedByRecipient: [],
    labels: []
  };
  console.log('Building new mail with input:', input);

  // Filling fields with input according to the schema of newMail
  for (const field of Object.keys(input)) {
    const cfg = mailInputSchema[field];
    // Normalizing the field if specified in the schema
    if (cfg && cfg.normalize) {
      newMail[field] = Array.isArray(input[field]) ? input[field] : [input[field]];
    } else {
      newMail[field] = input[field];
    }
  }

  const msgBody = newMail.body || '';
  const msgTitle = newMail.title || '';
  newMail.urls = extractUrlsFromMessage(msgBody).concat(extractUrlsFromMessage(msgTitle));
  // log the extracted URLs for debugging
  console.log(`Extracted URLs from message: ${newMail.urls.join(', ')}`);

  mails.push(newMail);
  return newMail;
}

/**
 * @brief Extracts URLs from a message body or title.
 * @param {*} msg The message body or title to extract URLs from.
 * @returns the list of URLs found in the message.
 */
function extractUrlsFromMessage(msg) {
  const urlRegex = /\bhttps?:\/\/(?:www\.)?[a-zA-Z0-9\-]+\.[a-zA-Z]{2,}(?:\.[a-zA-Z]{2,})?(?:\/[^\s]*)?\b/g;
  return msg.match(urlRegex) || [];
}


/**
 * Filters a newMail object to expose only public fields in the API response.
 * Includes internal public fields like id and timestamp.
 *
 * @param {object} newMail - Full newMail object
 * @returns {object} - Public-facing newMail object
 */
function filterMailForOutput(newMail) {
  const output = {};

  // Include all public fields from schema
  for (const field in mailInputSchema) {
    if (mailInputSchema[field].public && newMail[field] !== undefined) {
      output[field] = newMail[field];
    }
  }

  // Add internal public fields manually, can be deleted if this fields should not be public
  if ('id' in newMail) output.id = newMail.id;
  //if ('timestamp' in newMail) output.timestamp = newMail.timestamp;

  return output;
}

/**
 * Returns the last `limit` mails for a given user.
 * @param {*} username - the username of the user to get mails for
 * @param {*} spamLabelId - the label id for spam mails
 * @param {*} trashLabelId - the label id for trash mails
 * @param {*} labelId - the label id to filter mails by
 * @returns 
 */
function getMailsForUser(username, spamLabelId, trashLabelId, labelId = null) {
  return mails
    .filter(mail => {
      // exclude spam or trash mails
      if (mail.labels){
        if (mail.labels.includes(spamLabelId) || mail.labels.includes(trashLabelId)) {
          return false;
        }
      }

      const accessible = canUserAccessMail(mail, username);
      const matchesLabel = labelId === null || (mail.labels && mail.labels.includes(labelId));
      return accessible && matchesLabel;
    })
}

/**
 * finds a mail by its ID.
 * Throws an error if not found.
 * @param {*} id - the ID of the mail to find
 * @returns 
 */
function findMailById(id) {
  const mail = mails.find(m => m.id === id);
  if (!mail) {
    throw createError('Mail not found', { status: 404 });
  }

  return mail;
}

/**
 * checks if a user can access a mail.
 * A user can access a mail if they are the sender or one of the recipients.
 * @param {*} mail - the mail object to check
 * @param {*} username - the username of the user to check access for
 * @returns 
 */
function canUserAccessMail(mail, username) {
  console.log(`Checking access for user ${username} on mail ${mail.id}`);

  if (mail.from === username && !mail.deletedBySender) {
    console.log(`User ${username} is the sender of mail ${mail.id}`);
    return true;
  }

  if (Array.isArray(mail.to)) {
    if (mail.to.includes(username) &&
      mail.draft === false && !mail.deletedByRecipient.includes(username)) {
      // log the deletedByRecipient array for debugging
      console.log(`User ${username} is a recipient of mail ${mail.id}`);
      console.log(`Deleted by recipient: ${mail.deletedByRecipient}`);

      return true;
    }
  }

  return false;

}

/**
 * checks if a user can update a mail.
 * A user can update a mail only if he is the send and the mail is a draft
 * @param {*} mail - the mail object to check
 * @param {*} username - the username of the user to check access for
 * @returns 
 */
function canUserUpdateMail(mail, username) {
  console.log(`Checking update access for user ${username} on mail ${mail.id}`);
  if (mail.from !== username || mail.draft !== true) {
    throw createError('Only the sender of a draft mail can update it', { status: 403 });
  }
  return true;
}


/**
 * edits a mail object by applying updates to its title and body.
 * Throws an error if the updates are invalid.
 * @param {*} mail - the mail object to edit
 * @param {*} updates - the updates to apply to the mail
 * @returns 
 */
function editMail(mail, updates) {
  const editableFields = ['title', 'body'];

  // check if the update contains draft
  if ('draft' in updates) {
    if (mail.draft === true) {
      if (updates.draft === false) {
        mail.draft = false;
      }
    }
  }

  for (const field of editableFields) {
    if (field in updates) {
      if (typeof updates[field] !== 'string') {
        throw createError(`Field "${field}" must be a string`, { status: 400 });
      }
      mail[field] = updates[field];
    }
  }

  // update the mail in the array
  const index = mails.findIndex(m => m.id === mail.id);
  if (index === -1) {
    throw createError('Mail not found', { status: 404 });
  }

  mails[index] = mail;
}

/**
 * deletes a mail by its ID.
 * Throws an error if the mail is not found.
 * @param {*} user - the user object, used to check if the user is the sender or recipient
 * @param {*} id - the ID of the mail to delete
 */
function deleteMail(user, id) {
  const index = mails.findIndex(m => m.id === id);
  if (index === -1) {
    throw createError('Mail not found', { status: 404 });
  }
  console.log(`Deleting mail with ID ${id} for user ${user.username}`);

  const mail = mails[index];
  console.log(`Found mail:`, mail);

  // If the mail is a draft and the user is the sender, just remove it
  if (mail.draft === true && mail.from === user.username) {
    mails.splice(index, 1);
    return;
  }

  if (mail.from === user.username) {
    mail.deletedBySender = true;
  }

  if (Array.isArray(mail.to) && mail.to.includes(user.username)) {
    mail.deletedByRecipient.push(user.username);
  }

  // If both sender and recipient deleted the mail remove it from the array
  if (mail.deletedBySender && mail.deletedByRecipient.length === mail.to.length) {
    mails.splice(index, 1);
  } else {
    // otherwise update the mail in the array
    mails[index] = mail;
  }
}

/**
 * Searches for mails sent to a user where the title or body contains the query.
 * Case-insensitive search.
 * @param {string} username - the username of the user to search mails for
 * @param {string} query - the search query
 * @returns {Array} - array of mails matching the search criteria
 */
function searchMailsForUser(username, query) {
  const lowerQuery = query.toLowerCase();

  return mails.filter(mail => {
    const matchesContent =
      (mail.title && mail.title.toLowerCase().includes(lowerQuery)) ||
      (mail.body && mail.body.toLowerCase().includes(lowerQuery));

    return canUserAccessMail(mail, username) && matchesContent;
  });
}

/** Checks if a user can add a label to a mail.
 * Throws an error if the label is already attached to the mail or if the user does not have access to the mail.
 * @param {object} mail - The mail object to check.
 * @param {number} labelId - The ID of the label to check.
 * @returns {boolean} - Returns true if the user can add the label, otherwise throws an error.
 */
function canUserAddLabelToMail(mailId, labelId) {
  console.log(`Checking if user can add label ${labelId} to mail ${mailId}`);
  const mail = findMailById(mailId);

  if (!mail) {
    throw createError('Mail not found', { status: 404 });
  }
  console.log(`Found mail:`, mail);

  // Check if the label is already attached to the mail
  if (mail.labels) {
    if (mail.labels.includes(labelId)) {
      throw createError('Label already attached to this mail', { status: 400 });
    }
  }

  // check if the user can access the mail
  if (!canUserAccessMail(mail, mail.from)) {
    throw createError('User does not have access to this mail', { status: 403 });
  }
  return true;

}

/**
 * Attaches a label to a mail for a given user.
 * @param {number} mailId - The ID of the mail.
 * @param {number} labelId - The ID of the label.
 * @param {number} userId - The ID of the user performing the action.
 * @returns {object} The updated mail object.
 */
function addLabelToMail(mailId, labelId) {
  const mail = findMailById(mailId);
  if (!mail) {
    throw createError('Mail not found', { status: 404 });
  }

  console.log(`Adding label ${labelId} to mail ${mailId}`);
  console.log(`Mail before adding label:`, mail);

  if (!mail.labels) {
    mail.labels = [];
  }

  if (mail.labels.includes(labelId)) {
    throw createError('Label already attached to this mail', { status: 400 });
  }

  mail.labels.push(labelId);

  // Update the mail in the array
  const index = mails.findIndex(m => m.id === mail.id);
  if (index !== -1) {
    mails[index] = mail;
  } else {
    // Should not happen if findMailById worked
    throw createError('Mail not found during update', { status: 404 });
  }
}

/**
 * @brief Removes a label from a mail for a given user.
 * @param {number} mailId - The ID of the mail.
 * @param {number} labelId - The ID of the label to remove.
 * @throws {Error} If the label is not found on the mail.
 */
function removeLabelFromMail(mailId, labelId, username) {
  const mail = findMailById(mailId);
  if (!mail) {
    throw createError('Mail not found', { status: 404 });
  }

  if (canUserAccessMail(mail, username) === false) {
    throw createError('User does not have access to this mail', { status: 403 });
  }

  if (!mail.labels || !mail.labels.includes(labelId)) {
    throw createError('Label not found on this mail', { status: 404 });
  }

  // remove the label from the mail
  mail.labels = mail.labels.filter(l => l !== labelId);

  // Update the mail in the array
  const index = mails.findIndex(m => m.id === mail.id);
  if (index !== -1) {
    mails[index] = mail;
  } else {
    throw createError('Mail not found during update', { status: 404 });
  }
}


module.exports = {
  validateMailInput,
  buildMail,
  filterMailForOutput,
  getMailsForUser,
  findMailById,
  canUserAccessMail,
  canUserUpdateMail,
  editMail,
  deleteMail,
  searchMailsForUser,
  addLabelToMail,
  removeLabelFromMail,
  canUserAddLabelToMail
};
