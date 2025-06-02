const { buildMail, filterMailForOutput, validateMailInput, findMailById, editMail, deleteMail, userIsSender, canUserAccessMail, getMailsForUser, searchMailsForUser } = require('../models/mails.js');
const { badRequest, created, ok, noContent, forbidden } = require('../utils/httpResponses');
const { httpError, createError } = require('../utils/error');
const users = require('../models/users.js');
const net = require("net");

/**
 * Checks a list of URLs by sending them to a server for validation.
 * @param urls the list of URLs to check
 * @returns true if any URL is blacklisted, false otherwise
 */
async function checkBlacklistedUrl(urls) {
  return new Promise((resolve, reject) => {
    let urlIndex = 0;

    // Connect to the server at the specified port and address
    const client = net.createConnection({ host:'bloom-filter', port: 12345 }, ()  => {
      console.log('Connected to server');
      // send the first URL to the server
      client.write(`GET ${urls[urlIndex]}\n`);
      urlIndex++;
    });

    client.on('data', (data) => {
      console.log('Received data from server:', data.toString());

      // split the response into lines and check the status
      const status = data.toString().split('\n')
      if (status[0] === '200 OK') {

        // Check if the URL is blacklisted
        if (status[2] === 'true true') {
          console.log(`URL ${urls[urlIndex - 1]} is blacklisted`);
          client.destroy();
          resolve(true);
          return;
        }
      }

      // send the next URL if available
      if (urlIndex < urls.length) {
        client.write(`GET ${urls[urlIndex]}\n`);
        urlIndex++;
      } else {
        console.log('All URLs processed, closing connection');
        client.destroy();
        resolve(false);
      }
    });

    // handle error events
    client.on('error', (error) => {
      console.error('error connecting to server:', error);
      reject(error);
    });
  });
}

/**
 * POST /api/mails
 * Creates a new mail and stores it in memory.
 * Requires user to be logged in (loginToken).
 */
async function createMail(req, res) {
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

  // save the mail body to a variable
  const msg = mailInput.body || '';

  const urlRegex =
    /(https:\/\/www\.|http:\/\/www\.|https:\/\/|http:\/\/)?[a-zA-Z]{2,}(\.[a-zA-Z]{2,})(\.[a-zA-Z]{2,})?\/[a-zA-Z0-9]{2,}|((https:\/\/www\.|http:\/\/www\.|https:\/\/|http:\/\/)?[a-zA-Z]{2,}(\.[a-zA-Z]{2,})(\.[a-zA-Z]{2,})?)|(https:\/\/www\.|http:\/\/www\.|https:\/\/|http:\/\/)?[a-zA-Z0-9]{2,}\.[a-zA-Z0-9]{2,}\.[a-zA-Z0-9]{2,}(\.[a-zA-Z0-9]{2,})?/g;

  // Extract URLs from the mail body using the regex
  const urls = msg.match(urlRegex);

  // check if any URLs are present in the mail body
  if (urls && urls.length > 0) {
    let isBlacklisted = false;

    // Check if any of the URLs are blacklisted
    try {
      isBlacklisted = await checkBlacklistedUrl(urls);
    } catch (error) {
      console.error('Error checking blacklisted URLs:', error);
    }
    // If any URL is blacklisted, return an error response
    if (isBlacklisted) {
      return badRequest(res, 'Mail contains blacklisted URLs');
    }
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

  // Checks array doesn't contain empty strings
  const allValid = toField.every(u => typeof u === 'string' && u !== '');
  if (!allValid) {
    throw createError('"to" must not contain empty strings', { status: 400 });
  }

  // Filter "to" field to include only existing users
  const existingRecipients = toField.filter(username => {
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
