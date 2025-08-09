// controllers/mails.js
const { Types } = require('mongoose');
const { created, ok, noContent, badRequest } = require('../utils/httpResponses');
const { httpError } = require('../utils/error');

const {
  buildMail,
  getMailsForUser,
  findMailById,
  editMail,
  deleteMail,
  searchMailsForUser,
  addLabelToMail,
  removeLabelFromMail
} = require('../services/mailServices');

const { getSystemLabelId, getLabelIdByName } = require('../services/labelServices');
const { anyUrlBlacklisted, addUrlsToBlacklist } = require('../services/blacklistService');

function isValidObjectId(id) {
  return Types.ObjectId.isValid(id);
}

/**
 * GET /api/mails
 * Query params:
 *   labelId (optional) - ObjectId string of label to filter by
 *   limit (optional) - number of results (default 50)
 */
async function listMails(req, res) {
  const userId = req.user.id;
  const username = req.user.username;
  const { labelId = null, limit = 50 } = req.query;

  if (labelId !== null && !isValidObjectId(labelId)) {
    return badRequest(res, 'Label ID must be a valid ObjectId');
  }

  try {
    const spamId = await getSystemLabelId(userId, 'spam');
    const trashId = await getSystemLabelId(userId, 'trash');
    const mails = await getMailsForUser(username, spamId, trashId, labelId, Number(limit));
    return ok(res, mails);
  } catch (err) {
    return httpError(res, err);
  }
}

/**
 * POST /api/mails
 * Body: { title, body, to: string[], draft: boolean }
 * Creates a new mail (or draft) for the logged-in user.
 */
async function createMail(req, res) {
  const userId = req.user.id;
  const username = req.user.username;
  const { title, body, to, draft } = req.body;

  if (!title || !body || !Array.isArray(to)) {
    return badRequest(res, 'Missing required fields: title, body, to[]');
  }

  try {
    // Build mail object with initial labels
    const mailData = {
      from: username,
      to,
      title,
      body,
      draft: Boolean(draft),
      labels: []
    };

    // Auto-assign default label
    if (draft) {
      const draftsId = await getSystemLabelId(userId, 'drafts');
      mailData.labels.push(draftsId);
    } else {
      const sentId = await getSystemLabelId(userId, 'sent');
      mailData.labels.push(sentId);
    }

    // If any URL in the mail is blacklisted, auto-tag as spam
    if (await anyUrlBlacklisted((mailData.urls || []))) {
      const spamId = await getSystemLabelId(userId, 'spam');
      mailData.labels.push(spamId);
    }

    const newMail = await buildMail(mailData);
    return created(res, newMail);
  } catch (err) {
    return httpError(res, err);
  }
}

/**
 * GET /api/mails/:id
 */
async function getMailById(req, res) {
  const id = req.params.id;
  if (!isValidObjectId(id)) {
    return badRequest(res, 'Mail ID must be a valid ObjectId');
  }
  try {
    const mail = await findMailById(id);
    return ok(res, mail);
  } catch (err) {
    return httpError(res, err);
  }
}

/**
 * PATCH /api/mails/:id
 * Body: Partial mail fields (only drafts can be edited)
 */
async function updateMail(req, res) {
  const id = req.params.id;
  if (!isValidObjectId(id)) {
    return badRequest(res, 'Mail ID must be a valid ObjectId');
  }
  try {
    const updated = await editMail(id, req.body);
    return ok(res, updated);
  } catch (err) {
    return httpError(res, err);
  }
}

/**
 * DELETE /api/mails/:id
 * Marks a mail as deleted (or permanently removes if all parties deleted)
 */
async function removeMail(req, res) {
  const id = req.params.id;
  if (!isValidObjectId(id)) {
    return badRequest(res, 'Mail ID must be a valid ObjectId');
  }
  try {
    await deleteMail(id, req.user.username);
    return noContent(res);
  } catch (err) {
    return httpError(res, err);
  }
}

/**
 * GET /api/mails/search?q=...
 * Full-text search for mails visible to the user
 */
async function searchMails(req, res) {
  const q = req.query.q;
  if (!q || typeof q !== 'string') {
    return badRequest(res, 'Missing search query');
  }
  try {
    const results = await searchMailsForUser(req.user.username, q);
    return ok(res, results);
  } catch (err) {
    return httpError(res, err);
  }
}

/**
 * POST /api/mails/:id/labels/:labelId
 * Attach a label to a mail (manual labeling)
 */
async function attachLabel(req, res) {
  const { id, labelId } = req.params;
  if (!isValidObjectId(id) || !isValidObjectId(labelId)) {
    return badRequest(res, 'IDs must be valid ObjectIds');
  }
  try {
    const updated = await addLabelToMail(id, labelId, req.user.username);
    return ok(res, updated);
  } catch (err) {
    return httpError(res, err);
  }
}

/**
 * DELETE /api/mails/:id/labels/:labelId
 * Remove a label from a mail (manual unlabeling)
 */
async function detachLabel(req, res) {
  const { id, labelId } = req.params;
  if (!isValidObjectId(id) || !isValidObjectId(labelId)) {
    return badRequest(res, 'IDs must be valid ObjectIds');
  }
  try {
    const updated = await removeLabelFromMail(id, labelId, req.user.username);
    return ok(res, updated);
  } catch (err) {
    return httpError(res, err);
  }
}

/**
 * POST /api/mails/:id/spam
 * Mark a mail as spam and add its URLs to the blacklist.
 */
async function markAsSpam(req, res) {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    return badRequest(res, 'Mail ID must be a valid ObjectId');
  }
  try {
    const spamId = await getSystemLabelId(req.user.id, 'spam');
    const updated = await addLabelToMail(id, spamId, req.user.username);

    // Add its URLs to blacklist
    if (updated.urls && updated.urls.length) {
      await addUrlsToBlacklist(updated.urls);
    }

    return ok(res, updated);
  } catch (err) {
    return httpError(res, err);
  }
}

module.exports = {
  listMails,
  createMail,
  getMailById,
  updateMail,
  removeMail,
  searchMails,
  attachLabel,
  detachLabel,
  markAsSpam
};
