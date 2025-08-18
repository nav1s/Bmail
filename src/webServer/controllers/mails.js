const { Types } = require('mongoose');
const { created, ok, noContent, badRequest } = require('../utils/httpResponses');
const { httpError } = require('../utils/error');

const {
  // service entrypoints
  buildMail,
  getMailsForUser,
  findMailByIdForUser,
  editMailForUser,
  deleteMail,
  searchMailsForUser,
  addLabelToMail,
  removeLabelFromMail,
} = require('../services/mailServices');

const {
  getisDefaultLabelId,
  getLabelIdByName,
} = require('../services/labelServices');

const isValidObjectId = (id) => Types.ObjectId.isValid(id);
const mailLimit = 50;

/**
 * List mails for the inbox view of the current user.
 * Supports optional filtering by label and a limit.
 *
 * @param {import('express').Request} req - Uses `user.username`, `user.id`, and query `{ labelId?, limit? }`.
 * @param {import('express').Response} res - Sends 200 with an array of mails.
 * @returns {Promise<void>} Sends the HTTP response.
 * @throws Sends 400 if labelId is invalid; 500 via httpError on service errors.
 */
async function listInbox(req, res) {
  const username = req.user.username;
  const userId = req.user.id;
  const { labelId = null, limit = 50 } = req.query;

  if (labelId && !isValidObjectId(labelId)) {
    return badRequest(res, 'Label ID must be a valid ObjectId');
  }

  try {
    // System labels used for default inbox filtering
    const spamId = await getisDefaultLabelId(userId, 'spam');
    const trashId = await getisDefaultLabelId(userId, 'trash');

    const mails = await getMailsForUser(
      username,
      spamId,
      trashId,
      labelId || null,
      Number(limit)
    );

    return ok(res, mails);
  } catch (err) {
    return httpError(res, err);
  }
}

/**
 * List mails by a label id or by label name.
 * Accepts either an ObjectId-like string or a label name.
 *
 * @param {import('express').Request} req - `params.label` (id or name), query `{ limit? }`.
 * @param {import('express').Response} res - Sends 200 with matching mails.
 * @returns {Promise<void>} Sends the HTTP response.
 * @throws Sends 500 via httpError if label resolution or fetch fails.
 */
async function listMailsByLabel(req, res) {
  
  const username = req.user.username;
  const userId = req.user.id;
  const { label } = req.params;
  const { limit = 50 } = req.query;
  console.log("in listMailsByLabel label:" + label)
  try {
    const spamId = await getisDefaultLabelId(userId, 'spam');
    const trashId = await getisDefaultLabelId(userId, 'trash');
    console.log("spam label id: " + spamId + " trash: " + trashId)
    // Accept either a label id or a name
    const labelId = isValidObjectId(label)
      ? label
      : await getLabelIdByName(userId, label);
    console.log("3. in listMailsByLabel label ID:" + labelId)  

    const mails = await getMailsForUser(
      username,
      spamId,
      trashId,
      labelId,
      Number(limit)
    );

    return ok(res, mails);
  } catch (err) {
    return httpError(res, err);
  }
}

/**
 * Create a new mail or a draft for the current user.
 * Non-drafts require title/body/to; drafts may include any of them.
 *
 * @param {import('express').Request} req - Body `{ title?, body?, to?, draft? }`.
 * @param {import('express').Response} res - Sends 201 with the created mail.
 * @returns {Promise<void>} Sends the HTTP response.
 * @throws Sends 400 for missing required fields; 500 via httpError on service errors.
 */
async function createMail(req, res) {
  const userId = req.user.id;
  const username = req.user.username;
  const { title, body, to, draft } = req.body || {};
  const isDraft = !!draft;

  if (!isDraft) {
    if (!title || !body || !Array.isArray(to)) {
      return badRequest(res, 'Missing required fields: title, body, to[]');
    }
  } else {
    const hasTitle = typeof title === 'string' && title.trim() !== '';
    const hasBody  = typeof body  === 'string' && body.trim()  !== '';
    const hasTo    = Array.isArray(to) && to.length > 0;
    if (!(hasTitle || hasBody || hasTo)) {
      return badRequest(res, 'Draft must include at least one of: title, body, or to[]');
    }
  }

  try {
    const spamId   = await getisDefaultLabelId(userId, 'spam');
    const sentId   = await getisDefaultLabelId(userId, 'sent');
    const draftsId = await getisDefaultLabelId(userId, 'drafts');

    const newMail = await buildMail(
      { from: username, to, title, body, draft: isDraft },
      { userId, system: { spamId, sentId, draftsId } }
    );

    return created(res, newMail);
  } catch (err) {
    return httpError(res, err);
  }
}


/**
 * Fetch a single mail by id if the user has access.
 * Useful for opening a message view.
 *
 * @param {import('express').Request} req - `params.id` must be a valid ObjectId.
 * @param {import('express').Response} res - Sends 200 with the mail object.
 * @returns {Promise<void>} Sends the HTTP response.
 * @throws Sends 400 for invalid id; 500 via httpError on service errors.
 */
async function getMailById(req, res) {
  const id = req.params.id;
  if (!isValidObjectId(id)) return badRequest(res, 'Mail ID must be a valid ObjectId');

  try {
    const mail = await findMailByIdForUser(id, req.user.username);
    return ok(res, mail);
  } catch (err) {
    return httpError(res, err);
  }
}

/**
 * Update a draft mail’s content for the owner.
 * Body may include title/body changes.
 *
 * @param {import('express').Request} req - `params.id` and a partial body.
 * @param {import('express').Response} res - Sends 200 with the updated mail.
 * @returns {Promise<void>} Sends the HTTP response.
 * @throws Sends 400 for invalid id; 500 via httpError on service errors.
 */
async function updateMailById(req, res) {
  const id = req.params.id;
  if (!isValidObjectId(id)) return badRequest(res, 'Mail ID must be a valid ObjectId');

  try {
    const updated = await editMailForUser(id, req.user.username, req.body || {});
    return ok(res, updated);
  } catch (err) {
    return httpError(res, err);
  }
}

/**
 * Delete a mail for the current user (soft delete).
 * It may be hard-deleted when no one else retains access.
 *
 * @param {import('express').Request} req - `params.id` must be a valid ObjectId.
 * @param {import('express').Response} res - Sends 204 on success.
 * @returns {Promise<void>} Sends the HTTP response.
 * @throws Sends 400 for invalid id; 500 via httpError on service errors.
 */
async function deleteMailById(req, res) {
  const id = req.params.id;
  if (!isValidObjectId(id)) return badRequest(res, 'Mail ID must be a valid ObjectId');

  try {
    await deleteMail(id, req.user.username);
    return noContent(res);
  } catch (err) {
    return httpError(res, err);
  }
}

/**
 * Full-text search across the user’s mails.
 * Looks in title/body; case-insensitive.
 *
 * @param {import('express').Request} req - `params.query` or `query.q`, plus optional `query.limit`.
 * @param {import('express').Response} res - Sends 200 with array of results.
 * @returns {Promise<void>} Sends the HTTP response.
 * @throws Sends 400 for empty query; 500 via httpError on service errors.
 */
async function searchMails(req, res) {
  const username = req.user.username;
  const query = req.params.query ?? req.query.q;
  const limit = Number(req.query.limit ?? mailLimit) || mailLimit;
  console.log(username + " " + query + " " +limit)

  if (!query || typeof query !== 'string' || !query.trim()) {
    return badRequest(res, 'Search query must be a non-empty string');
  }

  try {
    const results = await searchMailsForUser(username, query, limit);
    return res.json(results);
  } catch (err) {
    return httpError(res, err);
  }
}


// POST /api/mails/:mailId/labels
/**
 * Attach a label to a specific mail.
 * Requires both mailId and labelId to be valid ObjectIds.
 *
 * @param {import('express').Request} req - `params.mailId`, body `{ labelId }`.
 * @param {import('express').Response} res - Sends 200 with updated mail.
 * @returns {Promise<void>} Sends the HTTP response.
 * @throws Sends 400 for invalid ids; 500 via httpError on service errors.
 */
async function attachLabelToMail(req, res) {
  const { mailId } = req.params;
  const { labelId } = req.body || {};

  if (!isValidObjectId(mailId) || !isValidObjectId(labelId)) {
    return badRequest(res, 'IDs must be valid ObjectIds');
  }

  try {
    const updated = await addLabelToMail(mailId, labelId, req.user.username, req.user.id);
    return ok(res, updated);
  } catch (err) {
    return httpError(res, err);
  }
}


/**
 * Remove a label from a mail.
 * Both ids must be valid ObjectIds.
 *
 * @param {import('express').Request} req - `params.mailId` and `params.labelId`.
 * @param {import('express').Response} res - Sends 200 with updated mail.
 * @returns {Promise<void>} Sends the HTTP response.
 * @throws Sends 400 for invalid ids; 500 via httpError on service errors.
 */
async function detachLabelFromMail(req, res) {
  const { mailId, labelId } = req.params;

  if (!isValidObjectId(mailId) || !isValidObjectId(labelId)) {
    return badRequest(res, 'IDs must be valid ObjectIds');
  }

  try {
    const updated = await removeLabelFromMail(mailId, labelId, req.user.username);
    return ok(res, updated);
  } catch (err) {
    return httpError(res, err);
  }
}

module.exports = {
  listInbox,
  listMailsByLabel,
  createMail,
  getMailById,
  updateMailById,
  deleteMailById,
  searchMails,
  attachLabelToMail,
  detachLabelFromMail,
};
