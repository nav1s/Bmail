const { buildMail, filterMailForOutput } = require('../models/mailSchema');
const { badRequest, created, unauthorized, ok, notFound, noContent } = require('../utils/httpResponses');
const { mails, users } = require('../data/memory');


/**
 * POST /api/mails
 * Creates a new mail and stores it in memory.
 * Requires user to be logged in (loginToken).
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
function createMail(req, res) {
  // converts "to" from names to ids, must be hard coded "to" field
  const toUsernames = req.body.to;
  if (!Array.isArray(toUsernames)) {
    return badRequest(res, '"to" must be an array');
  }

  // Try to match usernames to users
  const toIds = toUsernames
    .map(name => users.find(u => u.username === name))
    .filter(u => u) // drop non-existent usernames
    .map(u => u.id); // get only the IDs

  // Build mail with sender injected as 'from'
  const input = {
  ...req.body,
  from: req.user.id,
  to: toIds // Replace usernames with valid IDs
  };

  // Creating new mail
  const existing = mails.map(mail => mail.id);  // Get existing mail IDs
  const maxId = existing.length === 0 ? 0 : Math.max(...existing); // Find the maximum ID
  const id = maxId + 1; // Increment to get the next ID
  const newMail = buildMail(input, id);

  if (!newMail.success) {
    return badRequest(res, newMail.error);
  }

  // Store the mail and return public-facing response
  mails.push(newMail.mail);
  return created(res, filterMailForOutput(newMail.mail));
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
  const userId = req.user.id;
  //fetching mails, in LIFO order
  const relevant = mails
    .filter(mail =>
      mail.from === userId || (Array.isArray(mail.to) && mail.to.includes(userId))
    )
    .slice(-50)
    .reverse()
    .map(filterMailForOutput);

  res.json(relevant);
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
  const id = parseInt(req.params.id, 10);
  const mail = mails.find(m => m.id === id);

  if (!mail) {
    return notFound(res, 'Mail not found');
  }

  // Checks if im not the sender gnor the recipiant
  const isSender = mail.from === req.user.id;
  const isRecipient = Array.isArray(mail.to) && mail.to.includes(req.user.id);
  if (!isSender && !isRecipient) {
    return unauthorized(res, 'You are not allowed to view this mail');
  }

  return ok(res, filterMailForOutput(mail));
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

  const id = parseInt(req.params.id, 10);
  const mail = mails.find(m => m.id === id);

  if (!mail) {
    return notFound(res, 'Mail not found');
  }
  // Checks if im the sender
  if (mail.from !== req.user.id) {
    return unauthorized(res, 'Only the sender can update this mail');
  }
  // Enable editing of body and title
  const editableFields = ['title', 'body'];
  for (const field of editableFields) {
    if (field in req.body) {
      mail[field] = req.body[field];
    }
  }

  return ok(res, filterMailForOutput(mail));
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
  const id = parseInt(req.params.id, 10);
  const index = mails.findIndex(m => m.id === id);

  if (index === -1) {
    return notFound(res, 'Mail not found');
  }
  // checks if im sender or reciever
  const mail = mails[index];
  const isSender = mail.from === req.user.id;
  const isRecipient = Array.isArray(mail.to) && mail.to.includes(req.user.id);

  if (!isSender && !isRecipient) {
    return unauthorized(res, 'You are not allowed to delete this mail');
  }

  mails.splice(index, 1);
  return noContent(res);
}

/**
 * GET /api/mails/search/:query
 * Returns all mails sent to the user where title or body includes the query (case-insensitive).
 *
 * @param {import('express').Request} req - Express request, expects :query param and req.user
 * @param {import('express').Response} res - Express response
 */
function searchMails(req, res) {
  const userId = req.user.id;
  const query = req.params.query;

  const results = mails
    .filter(mail =>
      (
        mail.from === userId ||
        (Array.isArray(mail.to) && mail.to.includes(userId))
      ) && 
      (
        (mail.title && mail.title.includes(query)) || (mail.body && mail.body.includes(query))
      )
    )
    .map(filterMailForOutput);

  return res.json(results);
}



module.exports = {
  createMail,
  listInbox,
  getMailById,
  updateMailById,
  deleteMailById,
  searchMails
};
