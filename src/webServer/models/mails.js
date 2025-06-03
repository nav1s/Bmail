const { createError } = require('../utils/error');

const mails = []; // [{ id, from, to[], title, body, timestamp }]
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
  from:   { public: true },
  to:     { public: true, normalize: true },
  title:  { public: true },
  body:   { public: true }
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

  /* need to implement bloom filter checks
  // Reject if newMail contains blacklisted URLs in title or body
  const combinedText = [input.title, input.body].join(' ');
  if (!validateBodyAndTitle(combinedText)) {
  } */

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
    id : mailIdCounter++,
    timestamp: new Date().toISOString(),
  };

  // Filling fields with input according to the schema of newMail
  for (const field of Object.keys(input)) {
    const cfg = mailInputSchema[field];
    // Normalizing the
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

  // Add internal public fields manually, can be deleted if this fields shouldnt be public
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
    .filter(mail => mail.from === username ||
      (Array.isArray(mail.to) && mail.to.includes(username)))
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
  return (
    mail.from === username || (Array.isArray(mail.to) && mail.to.includes(username))
  );
}

/**
 * checks if a user is the sender of a mail.
 * Throws an error if the user is not the sender.
 * @param {*} mail - the mail object to check
 * @param {*} username - the username of the user to check access for
 */
function userIsSender(mail, username) {
  if (mail.from !== username) {
    throw createError('Only the sender can update this mail', { status: 403 });
  }
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

  for (const field of editableFields) {
    if (field in updates) {
      if (typeof updates[field] !== 'string') {
        throw createError(`Field "${field}" must be a string`, { status: 400 });
      }
      mail[field] = updates[field];
    }
  }

  return mail;
}

/**
 * deletes a mail by its ID.
 * Throws an error if the mail is not found.
 * @param {*} id - the ID of the mail to delete
 */
function deleteMail(id) {
  const index = mails.findIndex(m => m.id === id);
  if (index === -1) {
    throw createError('Mail not found', { status: 404 });
  }
  mails.splice(index, 1);
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

  return mails.filter(mail => { const isSenderOrRecipient = mail.from === username ||
      (Array.isArray(mail.to) && mail.to.includes(username));

    const matchesContent =
      (mail.title && mail.title.toLowerCase().includes(lowerQuery)) ||
      (mail.body && mail.body.toLowerCase().includes(lowerQuery));

    return isSenderOrRecipient && matchesContent;
  });
}



module.exports = {
  validateMailInput,
  buildMail,
  filterMailForOutput,
  getMailsForUser,
  findMailById,
  canUserAccessMail,
  userIsSender,
  editMail,
  deleteMail,
  searchMailsForUser
};
