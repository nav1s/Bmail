const { buildMail, filterMailForOutput, validateMailInput, findMailById, editMail, deleteMail, canUserAccessMail, getMailsForUser, searchMailsForUser, canUserUpdateMail, addLabelToMail, removeLabelFromMail, canUserAddLabelToMail } = require('../models/mails.js');
const { badRequest, created, ok, noContent, forbidden } = require('../utils/httpResponses');
const { httpError, createError } = require('../utils/error');
const { defaultLabelNames, addMailToLabel, removeMailFromLabel, getLabelByName, canUserAddMailToLabel } = require('../models/labels.js');
const net = require("net");

const mailLimit = 50;

/**
 * Checks a list of URLs by sending them to a server for validation.
 * @param urls the list of URLs to check
 * @returns true if any URL is blacklisted, false otherwise
 */
async function checkBlacklistedUrl(urls) {
  return new Promise((resolve, reject) => {
    let urlIndex = 0;

    // Connect to the server at the specified port and address
    const client = net.createConnection({ host: 'bloom-filter', port: 12345 }, () => {
      console.log('Connected to server');
      // log the urls being sent
      console.log('Sending this url to the server ', urls[urlIndex]);
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
        console.log('Sending this url to the server ', urls[urlIndex]);
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
 * This function checks if a message contains any blacklisted URLs.
 * @param msg The message body or title to check for blacklisted URLs.
 * @returns true if any blacklisted URLs are found, false otherwise.
 */
async function isMessageValid(msg) {
  const urlRegex = /\bhttps?:\/\/(?:www\.)?[a-zA-Z0-9\-]+\.[a-zA-Z]{2,}(?:\.[a-zA-Z]{2,})?(?:\/[^\s]*)?\b/g;

  // Extract URLs from the mail body using the regex
  const urls = msg.match(urlRegex);

  let isInvalid = false;
  if (urls !== null)
    if (urls.length > 0) {
      // Check if any of the URLs are blacklisted
      try {
        isInvalid = await checkBlacklistedUrl(urls);
      } catch (error) {
        console.error('Error checking blacklisted URLs:', error);
      }
    }

  return isInvalid;

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
    console.error('Error validating mail input:', err);
    return httpError(res, err);
  }

  const newMail = buildMail(mailInput);

  // check if the mail contains blacklisted URLs
  const msgBody = mailInput.body || '';
  const msgTitle = mailInput.title || '';
  const isBlacklisted = await isMessageValid(msgBody) || await isMessageValid(msgTitle);

  // move the mail to spam if it contains blacklisted URLs
  if (isBlacklisted) {
    try {
      const spamLabelId = getLabelByName(req.user.id, defaultLabelNames.spam);
      addLabelToMail(newMail.id, spamLabelId, req.user.username);
      addMailToLabel(newMail.id, spamLabelId, req.user.id);
    }
    catch (err) {
      console.error('Error getting spam label:', err);
      return httpError(res, err);
    }
  }

  // Build and store the mail
  try {
    console.log('Mail content:', newMail);
    // check if the mail is draft
    if (newMail.draft === true) {
      // get the draft label ID
      const draftLabelId = getLabelByName(req.user.id, defaultLabelNames.drafts);
      addLabelToMail(newMail.id, draftLabelId, req.user.username);
      addMailToLabel(newMail.id, draftLabelId, req.user.id);
    } else {
      // get the inbox label ID and add it to the mail
      const inboxLabelId = getLabelByName(req.user.id, defaultLabelNames.inbox);

      addLabelToMail(newMail.id, inboxLabelId, req.user.username);
      addMailToLabel(newMail.id, inboxLabelId, req.user.id);

    }
  } catch (err) {
    console.error('Error adding mail to inbox label:', err);
    return httpError(res, err);
  }
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

  const spamLabelId = getLabelByName(req.user.id, defaultLabelNames.spam);
  const trashLabelId = getLabelByName(req.user.id, defaultLabelNames.trash);

  const inbox = getMailsForUser(username, spamLabelId, trashLabelId)
    .slice(-mailLimit).reverse();
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
    console.error(`Error retrieving mail ${id} for user ${username}:`, err);
    return httpError(res, err);
  }
}

// todo add to blacklist when mail is labeled as spam
/**
 * PATCH /api/mails/:id
 * Edits the title/body of an existing mail with a given ID.
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

  // log the body of the request
  console.log(`User ${username} is trying to update mail ${id} with body:`, req.body);
  try {
    let mail = findMailById(id);
    canUserUpdateMail(mail, username);

    // check if we are sending a draft
    if (mail.draft === true) {
      console.log(`Mail ${id} is a draft, updating it...`);
      if (req.body.draft === false) {
        // detach the draft label from the mail
        const draftLabelId = getLabelByName(req.user.id, defaultLabelNames.drafts);
        removeLabelFromMail(mail.id, draftLabelId, username);
        removeMailFromLabel(mail.id, draftLabelId, req.user.id);

        // add the inbox label to the mail
        const inboxLabelId = getLabelByName(req.user.id, defaultLabelNames.inbox);
        addLabelToMail(mail.id, inboxLabelId, username);
        addMailToLabel(mail.id, inboxLabelId, req.user.id);

      }
    }

    editMail(mail, req.body);

    return noContent(res);
  } catch (err) {
    console.error(`Error updating mail ${id} for user ${username}:`, err);
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
    if (!canUserAccessMail(mail, username)) {
      console.warn(`User ${username} tried to delete mail ${id} they don't have access to`);
      return forbidden(res, 'You are not allowed to delete this mail');
    }

    console.info(`User ${username} deleted mail ${id}`);
    deleteMail(req.user, mail.id);
    return noContent(res);
  } catch (err) {
    console.error(`Error deleting mail ${id} for user ${username}:`, err);
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

  return toField
}

/**
 * POST /api/mails/:mailId/labels
 * attaches a label to a mail.
 */
function attachLabelToMail(req, res) {
  const mailId = Number(req.params.mailId);
  const labelId = Number(req.body.labelId);

  console.log(`User ${req.user.username} is trying to attach label ${labelId} to mail ${mailId}`);

  if (!Number.isInteger(mailId) || !Number.isInteger(labelId)) {
    return badRequest(res, 'Mail ID and Label ID must be valid integers');
  }

  const uid = req.user.id;
  const username = req.user.username;

  try {
    if (canUserAddLabelToMail(mailId, labelId) && canUserAddMailToLabel(mailId, labelId)) {
      addLabelToMail(mailId, labelId, username);
      addMailToLabel(mailId, labelId, uid);
      return noContent(res);
    }

  } catch (err) {
    console.error(`Error attaching label ${labelId} to mail ${mailId} for user ${username}:`, err);
    return httpError(res, err);
  }
};

/**
 * DELETE /api/mails/:mailId/labels/:labelId
 * detaches a label from a mail.
 */
function detachLabelFromMail(req, res) {
  const mailId = Number(req.params.mailId);
  const labelId = Number(req.params.labelId);

  console.log(`User ${req.user.username} is trying to detach label ${labelId} from mail ${mailId}`);

  if (!Number.isInteger(mailId) || !Number.isInteger(labelId)) {
    console.warn(`Invalid mailId or labelId: ${mailId}, ${labelId}`);
    return badRequest(res, 'Mail ID and Label ID must be valid integers');
  }

  const uid = req.user.id;
  const username = req.user.username;

  try {
    removeLabelFromMail(mailId, labelId, username);
    removeMailFromLabel(mailId, labelId, uid);
    return noContent(res);

  } catch (err) {
    console.error(`Error detaching label ${labelId} from mail ${mailId} for user ${username}:`, err);
    return httpError(res, err);
  }
}

/**
 * GET /api/mails/:label
 * Returns the last 50 mails sent to the user filtered by label.
 * Requires login.
 */
function listMailsByLabel(req, res) {
  const labelName = req.params.label;
  const username = req.user.username;

  try {
    const labelId = getLabelByName(req.user.id, labelName);
    let spamLabelId = getLabelByName(req.user.id, defaultLabelNames.spam);
    let trashLabelId = getLabelByName(req.user.id, defaultLabelNames.trash);

    if (labelName.toLowerCase() === "all") {
    const mails = getMailsForUser(username, spamLabelId, trashLabelId)
      .slice(-mailLimit).reverse();
      return res.json(mails.map(filterMailForOutput));
    }

    if (labelName === defaultLabelNames.spam) {
      spamLabelId = -1;
    }

    if (labelName === defaultLabelNames.trash) {
      trashLabelId = -1;
    }

    const mails = getMailsForUser(username, spamLabelId, trashLabelId, labelId)
      .slice(-mailLimit).reverse();
    return res.json(mails.map(filterMailForOutput));
  } catch (err) {
    console.error(`Error retrieving mails for label ${labelName} for user ${username}:`, err);
    return httpError(res, err);
  }
}


module.exports = {
  createMail,
  listInbox,
  getMailById,
  updateMailById,
  deleteMailById,
  searchMails,
  attachLabelToMail,
  detachLabelFromMail,
  listMailsByLabel
};
