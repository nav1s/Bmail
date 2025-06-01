const { buildMail, filterMailForOutput, validateMailInput, findMailById, editMail, deleteMail, userIsSender, canUserAccessMail, getMailsForUser, searchMailsForUser } = require('../models/mails.js');
const { badRequest, created, ok, noContent, forbidden } = require('../utils/httpResponses');
const { httpError, createError } = require('../utils/error');
const users = require('../models/users.js');

/**
 * POST /api/mails
 * Creates a new mail and stores it in memory.
 * Requires user to be logged in (loginToken).
 */
function createMail(req, res) {
  // Add sender ("from") to the mail
  const mailInput = {
    ...req.body,
    from: req.user.username,
  };

  // Validate recipients and mail structure
  try {
    validateMailInput(mailInput);
    mailInput.to = validateRecipients(mailInput.to);
  } catch (err) {
    return httpError(res, err);
  }

    // Build and store the mail
    const newMail = buildMail(mailInput);
    return created(res, filterMailForOutput(newMail));
  }

/**
 * GET /api/mails
 * Returns the last 50 mails sent to the logged-in user.
 * Requires login.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
function listInbox(req, res) {
  const username = req.user.username;
  const inbox = getMailsForUser(username, 50);
  return res.json(inbox.map(filterMailForOutput));
}


/**
 * GET /api/mails/:id
 * Returns the public-facing mail details for a specific mail ID.
 * Requires login.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
function getMailById(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return badRequest(res, 'Mail ID must be a valid integer');
  }
  const username = req.user.username;

  try {
    const mail = findMailById(id);
    if (!canUserAccessMail(mail, username)) {
      return forbidden(res, 'You are not allowed to view this mail');

    }

    return ok(res, filterMailForOutput(mail));
  } catch (err) {
    return httpError(res, err);
  }
}


/**
 * PATCH /api/mails/:id
 * Edits the title/body of an existing mail with a given ID.
 * Only the sender can update.
 * Requires login.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
function updateMailById(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return badRequest(res, 'Mail ID must be a valid integer');
  }
  const username = req.user.username;

  try {
    let mail = findMailById(id);
    userIsSender(mail, username);
    mail = editMail(mail, req.body);

    return ok(res, filterMailForOutput(mail));
  } catch (err) {
    return httpError(res, err);
  }
}

/**
 * DELETE /api/mails/:id
 * Deletes a mail by its ID if it exists.
 * Only the sender or one of the recipients may delete.
 * Requires login.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
function deleteMailById(req, res) {
  const id = Number(req.params.id);
  const username = req.user.username;

  try {
    const mail = findMailById(id);
    canUserAccessMail(mail, username);
    deleteMail(mail.id);
    return noContent(res);
  } catch (err) {
    return httpError(res, err);
  }
}


/**
 * GET /api/mails/search/:query
 * Returns all mails sent to the user where title or body includes the query (case-insensitive).
 *
 * @param {import('express').Request} req - Express request, expects :query param and req.user
 * @param {import('express').Response} res - Express response
 */
function searchMails(req, res) {
  const username = req.user.username;
  const query = req.params.query;

  if (!query || typeof query !== 'string') {
    return badRequest(res, 'Search query must be a non-empty string');
  }

  try {
    const results = searchMailsForUser(username, query);
    // Sends the public info of each mail found
    return res.json(results.map(filterMailForOutput));
  } catch (err) {
    return httpError(res, err);
  }
}


/**
 * Validates and normalizes the "to" field for mail recipients.
 * Accepts a string or an array of strings.
 *
 * @param {any} toField - The raw "to" field from the request body.
 * @returns {string[]} - Normalized array of non-empty recipient usernames.
 * @throws {Error} - If validation fails.
 */
function validateRecipients(toField) {
  // Checks for an array
  if (!Array.isArray(toField)) {
    throw createError('"to" must be an array', { status: 400 });
  }

  // Checks array doesnt contain empty strings
  const allValid = toField.every( u => typeof u === 'string' && u !== '' );
  if (!allValid) {
    throw createError('"to" must not contain empty strings', { status: 400 });
  }

  // Filter "to" field to include only existing users
    const existingRecipients  = toField.filter(username => {
      try {
        users.findUserByUsername(username);
        // returning "true" to let .filter know we add the username
        return true;
      } catch {
        // returning "false" to let .filter know to ignore the username
        return false;
      }
    });

    if (existingRecipients.length === 0) {
    throw createError('No valid recipients found', { status: 400 });
  }

  return existingRecipients;
}


module.exports = {
  createMail,
  listInbox,
  getMailById,
  updateMailById,
  deleteMailById,
  searchMails
};
