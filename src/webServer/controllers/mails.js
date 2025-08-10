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
  getSystemLabelId,
  getLabelIdByName,
} = require('../services/labelServices');

const isValidObjectId = (id) => Types.ObjectId.isValid(id);

/**
 * GET /api/mails
 * List inbox for the current user (excludes spam/trash by default).
 * Optional query:
 *   - labelId: string (ObjectId) — filter by label
 *   - limit: number — max number of mails (default 50)
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
    const spamId = await getSystemLabelId(userId, 'spam');
    const trashId = await getSystemLabelId(userId, 'trash');

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
 * GET /api/mails/byLabel/:label
 * List mails for a given label.
 * - :label can be either a label ObjectId or a label name (case-insensitive).
 * Optional query:
 *   - limit: number — max number of mails (default 50)
 */
async function listMailsByLabel(req, res) {
  
  const username = req.user.username;
  const userId = req.user.id;
  const { label } = req.params;
  const { limit = 50 } = req.query;
  console.log("in listMailsByLabel label:" + label)
  try {
    const spamId = await getSystemLabelId(userId, 'spam');
    const trashId = await getSystemLabelId(userId, 'trash');
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
 * POST /api/mails
 * Create a new mail or draft for the current user.
 * Required body: { title: string, body: string, to: string[], draft?: boolean }
 * Notes:
 *   - Validation & auto-labeling (sent/drafts/spam) happen in the service.
 */
async function createMail(req, res) {
  console.log(req.user);
  const userId = req.user.id;
  const username = req.user.username;
  const { title, body, to, draft } = req.body || {};

  if (!title || !body || !Array.isArray(to)) {
    return badRequest(res, 'Missing required fields: title, body, to[]');
  }

  try {
    const spamId   = await getSystemLabelId(userId, 'spam');
    const sentId   = await getSystemLabelId(userId, 'sent');
    const draftsId = await getSystemLabelId(userId, 'drafts');

    const newMail = await buildMail(
      {
        from: username,
        to,
        title,
        body,
        draft: Boolean(draft),
      },
      {
        userId,
        system: { spamId, sentId, draftsId },
      }
    );

    return created(res, newMail);
  } catch (err) {
    return httpError(res, err);
  }
}

/**
 * GET /api/mails/:id
 * Return a single mail if the current user has access to it.
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
 * PATCH /api/mails/:id
 * Edit a draft mail. Only the owner (from=me) may edit drafts.
 * Body may include title/body (service will whitelist & validate).
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
 * DELETE /api/mails/:id
 * Soft-deletes for the current user; hard-deletes when no one can access anymore.
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
 * GET /api/mails/search/:query
 * Full-text search across title/body for mails accessible by the current user.
 * Also accepts ?q=... for compatibility.
 */
async function searchMails(req, res) {
  const q = req.params.query || req.query.q;
  if (!q || typeof q !== 'string') return badRequest(res, 'Missing search query');

  try {
    const results = await searchMailsForUser(req.user.username, q);
    return ok(res, results);
  } catch (err) {
    return httpError(res, err);
  }
}

// POST /api/mails/:mailId/labels
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
 * DELETE /api/mails/:mailId/labels/:labelId
 * Detach a label from a mail.
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
