// services/mailServices.js
const { Types } = require('mongoose');
const { createError } = require('../utils/error');
const Mail = require('../models/mailsModel');
const User = require('../models/usersModel');                 // ← NEW: needed to resolve recipient userIds
const { Label } = require('../models/labelsModel');           // ← NEW: needed to resolve recipients' inbox labels
const { anyUrlBlacklisted, addUrlsToBlacklist } = require('./blacklistService');


/**
 * Ensure a value is a non-empty string.
 * Mirrors labels/users validation behavior.
 */
function assertNonEmptyString(field, value) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw createError(`${field} must be a non-empty string`, { type: 'VALIDATION', status: 400 });
  }
}

/**
 * Ensure a value is an array of non-empty strings.
 */
function assertStringArray(field, arr) {
  if (!Array.isArray(arr) || arr.length === 0) {
    throw createError(`${field} must be a non-empty array`, { type: 'VALIDATION', status: 400 });
  }
  for (const v of arr) {
    if (typeof v !== 'string' || v.trim() === '') {
      throw createError(`${field} must contain non-empty strings`, { type: 'VALIDATION', status: 400 });
    }
  }
}

/**
 * Extract URLs from a text blob (title/body). Keep simple & robust.
 */
function extractUrls(text) {
  const re = /\bhttps?:\/\/(?:www\.)?[a-zA-Z0-9\-_.]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?\b/g;
  return text.match(re) || [];
}

/** Normalize URL (lowercase, trim, strip trailing slash) */
function normalizeUrl(u) {
  if (typeof u !== 'string') return null;
  const s = u.trim().toLowerCase();
  if (!s) return null;
  return s.endsWith('/') ? s.slice(0, -1) : s;
}

/**
 * Reduce a mail doc/object to a safe output DTO based on schema `public` flags.
 * Always exposes a top-level `id` (string) derived from `_id`.
 */
function filterMailForOutput(mail) {
  const output = {};

  // Always expose id (string), even if _id isn't flagged public
  if (mail && (mail._id || mail.id)) {
    output.id = String(mail._id || mail.id);
  }

  const schemaPaths = Mail.schema.paths;

  // Include paths flagged as public (path-level OR caster-level for arrays)
  Object.keys(schemaPaths).forEach((path) => {
    const def = schemaPaths[path];
    const isPublic =
      (def.options && def.options.public) ||
      (def.caster && def.caster.options && def.caster.options.public);

    if (!isPublic) return;
    if (path === '_id') return; // we've already set output.id

    const value = mail[path];
    if (typeof value !== 'undefined') output[path] = value;
  });

  // Ensure labels are present and normalized (critical for UI state like Spam/Starred)
  if (Array.isArray(mail.labels)) {
    // prefer the public-filtered value if present; otherwise take from source
    const labels = Array.isArray(output.labels) ? output.labels : mail.labels;
    output.labels = labels.map((l) => String(l));
  }

  return output;
}



/**
 * Check whether a user can see a mail.
 * - Sender can see it unless they deleted it.
 * - Recipient(s) can see it unless it's a draft or they deleted it.
 */
function canUserAccessMail(mail, username) {
  return (
    (mail.from === username && !mail.deletedBySender) ||
    (Array.isArray(mail.to) &&
      mail.to.includes(username) &&
      !mail.draft &&
      !Array.isArray(mail.deletedByRecipient) ? true : !mail.deletedByRecipient.includes(username))
  );
}

/**
 * Create mail/draft; auto-label Sent/Drafts; Spam by Bloom; propagate Spam.
 * Additionally, auto-attach each recipient user's "inbox" label,
 * even when the mail is tagged as spam (per requirement).
 *
 * @param {object} mailData - { from, to[], title, body, draft }
 * @param {object} ctx - { userId, system: { spamId, sentId, draftsId } }
 */
async function buildMail(mailData, { userId, system }) {
  const { spamId, sentId, draftsId } = system || {};

  // validate
  assertNonEmptyString('from', mailData.from);
  assertNonEmptyString('title', mailData.title);
  assertNonEmptyString('body', mailData.body);
  assertStringArray('to', mailData.to);

  // urls
  const rawUrls = extractUrls(`${mailData.title} ${mailData.body}`);
  const urls = rawUrls.map(normalizeUrl).filter(Boolean);

  // system labels for the SENDER
  const labels = [];
  labels.push(mailData.draft ? draftsId : sentId);

  // bloom spam check
  const isSpam = urls.length > 0 && (await anyUrlBlacklisted(urls));
  if (isSpam) labels.push(spamId);

  // NEW: also attach each RECIPIENT's inbox label (even if spam)
  // We avoid circular imports by resolving via models directly.
  for (const rUsername of mailData.to) {
    const recipient = await User.findOne({ username: rUsername }).lean();
    if (!recipient) continue; // if a recipient isn't found, skip attaching inbox label

    // find recipient's "inbox" label (case-insensitive)
    const inboxLabel = await Label.findOne({
      userId: recipient._id,
      name: { $regex: '^inbox$', $options: 'i' },
    }).lean();

    if (inboxLabel && inboxLabel._id) {
      labels.push(inboxLabel._id);
    }
  }

  // de-duplicate labels and normalize to ObjectIds
  const dedupedLabelIds = Array.from(new Set(labels.map(String))).map((id) => new Types.ObjectId(id));

  // persist
  const mail = await Mail.create({ ...mailData, labels: dedupedLabelIds, urls });

  // propagation if spam
  if (isSpam && urls.length) {
    await addUrlsToBlacklist(urls);
    await tagMailsWithUrlsAsSpam(userId, mailData.from, urls, spamId);
  }

  return filterMailForOutput(mail.toObject ? mail.toObject() : mail);
}


/**
 * Get accessible mails for a user, optionally filtered by label.
 * Excludes spam/trash by default for the inbox view.
 *
 * @param {string} username
 * @param {string} spamLabelId
 * @param {string} trashLabelId
 * @param {string|null} labelId - if provided, returns only mails with this label
 * @param {number} limit
 */
async function getMailsForUser(username, spamLabelId, trashLabelId, labelId = null, limit = 50) {
  const baseQuery = {
    $or: [
      // Sent by me (and I didn't delete it)
      { from: username, deletedBySender: { $ne: true } },
      // To me (not a draft, and I didn't delete it)
      { to: username, draft: false, deletedByRecipient: { $ne: username } },
    ],
  };

  const and = [];

  if (labelId) {
    // Explicit label filter
    const lid = new Types.ObjectId(labelId);
    and.push({ labels: lid });

    // NEW: unless we are explicitly viewing Spam or Trash,
    // also exclude mails that are labeled Spam/Trash.
    // (Keeps "restore by removing spam label" behavior without stripping other labels.)
    const spamObjId = new Types.ObjectId(spamLabelId);
    const trashObjId = new Types.ObjectId(trashLabelId);
    const isSpamView  = String(lid) === String(spamObjId);
    const isTrashView = String(lid) === String(trashObjId);

    if (!isSpamView && !isTrashView) {
      and.push({ labels: { $ne: spamObjId } });
      and.push({ labels: { $ne: trashObjId } });
    }
  } else {
    // Inbox behavior: exclude spam + trash
    and.push({ labels: { $ne: new Types.ObjectId(spamLabelId) } });
    and.push({ labels: { $ne: new Types.ObjectId(trashLabelId) } });
  }

  const query = and.length ? { $and: [baseQuery, ...and] } : baseQuery;

  const docs = await Mail.find(query)
    .sort({ createdAt: -1 })
    .limit(Math.max(1, Number(limit) || 50))
    .lean();

  return docs.map(filterMailForOutput);
}


/**
 * Read a mail by id, enforce access, and return the public DTO.
 */
async function findMailByIdForUser(id, username) {
  const mail = await Mail.findById(id);
  if (!mail) throw createError('Mail not found', { type: 'NOT_FOUND', status: 404 });
  if (!canUserAccessMail(mail, username)) {
    throw createError('User does not have access to this mail', { status: 403 });
  }
  return filterMailForOutput(mail.toObject ? mail.toObject() : mail);
}

/**
 * Edit a draft (owner-only). Whitelist title/body and re-extract URLs.
 * @returns {Promise<object>} Updated mail DTO
 */
async function editMailForUser(mailId, username, updates) {
  const mail = await Mail.findById(mailId);
  if (!mail || !mail.draft) {
    throw createError('Mail not found', { type: 'NOT_FOUND', status: 404 });
  }
  if (mail.from !== username) {
    throw createError('User does not have access to edit this draft', { status: 403 });
  }

  const patch = {};

  if (updates.title != null) {
    assertNonEmptyString('title', updates.title);
    patch.title = updates.title;
  }
  if (updates.body != null) {
    assertNonEmptyString('body', updates.body);
    patch.body = updates.body;
  }

  // If either text field changed, recompute URLs
  if (patch.title != null || patch.body != null) {
    const nextTitle = patch.title != null ? patch.title : mail.title;
    const nextBody = patch.body != null ? patch.body : mail.body;
    patch.urls = extractUrls(`${nextTitle} ${nextBody}`);
  }

  const updated = await Mail.findByIdAndUpdate(mailId, patch, { new: true }).lean();
  return filterMailForOutput(updated);
}

/**
 * Soft-delete for the calling user; hard-delete when no party can access.
 * - If sender: mark deletedBySender = true
 * - If recipient: push username into deletedByRecipient
 */
async function deleteMail(mailId, username) {
  const mail = await Mail.findById(mailId);
  if (!mail) throw createError('Mail not found', { type: 'NOT_FOUND', status: 404 });

  let changed = false;

  if (mail.from === username && !mail.deletedBySender) {
    mail.deletedBySender = true;
    changed = true;
  }

  if (Array.isArray(mail.to) && mail.to.includes(username)) {
    if (!Array.isArray(mail.deletedByRecipient)) mail.deletedByRecipient = [];
    if (!mail.deletedByRecipient.includes(username)) {
      mail.deletedByRecipient.push(username);
      changed = true;
    }
  }

  // If neither side can see it anymore, hard-delete
  const visibleToSender = !mail.deletedBySender && mail.from === username;
  const visibleToAnyRecipient =
    Array.isArray(mail.to) && mail.to.some((u) => u !== username && !mail.deletedByRecipient?.includes(u));

  if (!visibleToSender && !visibleToAnyRecipient) {
    await Mail.deleteOne({ _id: mail._id });
    return;
  }

  if (changed) await mail.save();
}

/**
 * Full-text search within accessible mails (title/body).
 * Requires a text index on { title, body } in the model.
 */
async function searchMailsForUser(username, query) {
  if (typeof query !== 'string' || query.trim() === '') {
    throw createError('Query must be a non-empty string', { type: 'VALIDATION', status: 400 });
  }

  // First, fetch candidates via $text
  const candidates = await Mail.find(
    { $text: { $search: query } },
    { score: { $meta: 'textScore' } }
  )
    .sort({ score: { $meta: 'textScore' } })
    .lean();

  // Then, filter by access
  return candidates.filter((m) => canUserAccessMail(m, username)).map(filterMailForOutput);
}

/**
 * Attach a label to a mail (idempotent), enforcing access.
 */
async function addLabelToMail(mailId, labelId, username) {
  const mail = await Mail.findById(mailId);
  if (!mail) throw createError('Mail not found', { type: 'NOT_FOUND', status: 404 });
  if (!canUserAccessMail(mail, username)) {
    throw createError('User does not have access to this mail', { status: 403 });
  }

  const lId = new Types.ObjectId(labelId);
  if (!mail.labels.map(String).includes(String(lId))) {
    mail.labels.push(lId);
    await mail.save();
  }

  return filterMailForOutput(mail.toObject ? mail.toObject() : mail);
}

/**
 * Detach a label from a mail (idempotent), enforcing access.
 */
async function removeLabelFromMail(mailId, labelId, username) {
  const mail = await Mail.findById(mailId);
  if (!mail) throw createError('Mail not found', { type: 'NOT_FOUND', status: 404 });
  if (!canUserAccessMail(mail, username)) {
    throw createError('User does not have access to this mail', { status: 403 });
  }

  const lId = String(labelId);
  mail.labels = (mail.labels || []).filter((id) => String(id) !== lId);
  await mail.save();

  return filterMailForOutput(mail.toObject ? mail.toObject() : mail);
}

/**
 * Bulk-tag mails containing any of the given URLs as Spam for this user.
 * Scope to mails the user can see; avoid re-adding Spam.
 */
async function tagMailsWithUrlsAsSpam(userId, username, urls, spamLabelId) {
  const norms = Array.from(new Set((urls || []).map(normalizeUrl).filter(Boolean)));
  if (!norms.length) return;

  await Mail.updateMany(
    {
      urls: { $in: norms },
      $or: [
        { from: username, deletedBySender: { $ne: true } },
        { to: username, draft: false, deletedByRecipient: { $ne: username } },
      ],
      labels: { $ne: new Types.ObjectId(spamLabelId) },
    },
    { $addToSet: { labels: new Types.ObjectId(spamLabelId) } }
  );
}

module.exports = {
  canUserAccessMail,
  tagMailsWithUrlsAsSpam,
  buildMail,
  getMailsForUser,
  findMailByIdForUser,
  editMailForUser,
  deleteMail,
  searchMailsForUser,
  addLabelToMail,
  removeLabelFromMail,
};


