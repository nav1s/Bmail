const { createError } = require('../utils/error');
const { getLabelByUserAndId } = require('./labels'); // Import label model function

const mails = []; // [{ id, from, to[], title, body, timestamp, labels: [] }]
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
  labels: { public: false, default: [], required: false}
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

  // add default values for fields that aren't required and not in the input
  for (const field of Object.keys(mailInputSchema)) {
    if (!(field in input) && !mailInputSchema[field].required) {
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
    labels: mailInputSchema.labels.default ? [...mailInputSchema.labels.default] : [] // Initialize labels array
  };

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

  mails.push(newMail);
  return newMail;
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
 * @param {*} limit - the number of mails to return
 * @returns 
 */
function getMailsForUser(username, limit) {
  return mails
    .filter(mail => canUserAccessMail(mail, username))
    .slice(-limit).reverse();
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

  return (
    mail.from === username && !mail.deletedBySender ||
    (Array.isArray(mail.to) && mail.to.includes(username) &&
      mail.draft === false && mail.deletedByRecipient.includes(username) === false)
  );
}

/**
 * checks if a user can update a mail.
 * A user can update a mail only if he is the send and the mail is a draft
 * @param {*} mail - the mail object to check
 * @param {*} username - the username of the user to check access for
 * @returns 
 */
function canUserUpdateMail(mail, username) {
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
  if('draft' in updates) {
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

  const mail = mails[index];

  // If the mail is a draft and the user is the sender, just remove it
  if (mail.draft === true && mail.from === user.username) {
    mails.splice(index, 1);
    return;
  }

  if (mail.from === user.username) {
    mail.deletedBySender = true;
  } else if (Array.isArray(mail.to) && mail.to.includes(user.username)) {
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

/**
 * Attaches a label to a mail for a given user.
 * @param {number} mailId - The ID of the mail.
 * @param {number} labelId - The ID of the label.
 * @param {number} userId - The ID of the user performing the action.
 * @returns {object} The updated mail object.
 */
exports.addLabelToMail = (mailId, labelId) => {
  const mail = findMailById(mailId);

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
  searchMailsForUser
};
