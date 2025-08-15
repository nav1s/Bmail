const { Types } = require('mongoose');
const { createError } = require('../utils/error');
const Mail = require('../models/mailsModel');
const User = require('../models/usersModel');
const { Label } = require('../models/labelsModel');
const { anyUrlBlacklisted, addUrlsToBlacklist } = require('./blacklistService');

/** Minimal "looks like an address": requires exactly one @ and no spaces (demo). */
const EMAIL_RE = /^[^\s@]+@[^\s@]+$/;

/** Internal address → username, supports bb@bmail and bb@bmail.com (demo). */
function internalUsernameFromAddress(addr) {
  const m = /^([^@\s]+)@bmail(?:\.com)?$/i.exec(String(addr || ''));
  return m ? m[1] : null;
}

/** Split an array of "to" inputs on whitespace, commas, or semicolons; trim & drop empties. */
function tokenizeAddresses(toArray) {
  if (!Array.isArray(toArray)) return [];
  return toArray
    .flatMap((s) => String(s).split(/[\s,;]+/g))
    .map((s) => s.trim())
    .filter(Boolean);
}

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
    const labels = Array.isArray(output.labels) ? output.labels : mail.labels;
    output.labels = labels.map((l) => String(l));
  }

  return output;
}

/**
 * Check whether a user can see a mail.
 * Demo routing rule (no schema change):
 * - Recipients are stored as addresses (e.g., "bb@bmail" or "bb@bmail.com").
 * - A user "bb" has access if the "to" array contains either internal form.
 * Back-compat: if older mails stored bare usernames, we still honor those.
 */
function canUserAccessMail(mail, username) {
  const internalAddrs = [`${username}@bmail`, `${username}@bmail.com`];
  const toArr = Array.isArray(mail.to) ? mail.to : [];

  const recipientHasAccess =
    toArr.includes(internalAddrs[0]) ||
    toArr.includes(internalAddrs[1]) ||
    toArr.includes(username); // legacy

  const recipientNotDeleted =
    !Array.isArray(mail.deletedByRecipient) || !mail.deletedByRecipient.includes(username);

  return (
    (mail.from === username && !mail.deletedBySender) ||
    (recipientHasAccess && !mail.draft && recipientNotDeleted)
  );
}

/**
 * Create mail/draft; auto-label Sent/Drafts; Spam by blacklist; propagate Spam.
 * DEMO adjustments (no schema change):
 * - "to" must be addresses (tokens validated by EMAIL_RE); spaces split into multiple tokens.
 * - Store recipients in `mail.to` as addresses (e.g., "bb@bmail" or "bb@bmail.com").
 * - On send (not draft): attach Inbox label only for internal recipients,
 *   mapping address -> username via internalUsernameFromAddress().
 * - For demo rule "on create - don't allow @ in name": reject senders whose username contains '@'.
 */
async function buildMail(mailData, { userId, system }) {
  const { spamId, sentId, draftsId } = system || {};

  // validate common fields
  assertNonEmptyString('from', mailData.from);
  if (/@/.test(mailData.from)) {
    throw createError('Sender username must not contain "@" (demo rule)', {
      type: 'VALIDATION',
      status: 400,
    });
  }
  assertNonEmptyString('title', mailData.title);
  assertNonEmptyString('body', mailData.body);
  assertStringArray('to', mailData.to);

  // DEMO: normalize/validate "to" as addresses (split on spaces/commas/semicolons)
  const toTokens = tokenizeAddresses(mailData.to);
  const invalid = toTokens.filter((t) => !EMAIL_RE.test(t));
  if (invalid.length) {
    throw createError(`Invalid recipient address(es): ${invalid.join(', ')}`, {
      type: 'VALIDATION',
      status: 400,
    });
  }

  // URLs (normalize once)
  const rawUrls = extractUrls(`${mailData.title} ${mailData.body}`);
  const urls = rawUrls.map(normalizeUrl).filter(Boolean);

  // system labels for the SENDER
  const labels = [];
  // Only push valid ids; filter later as well to be extra safe
  if (mailData.draft ? draftsId : sentId) labels.push(mailData.draft ? draftsId : sentId);

  // if any URL is already blacklisted, mark Spam now (for the sender copy)
  const isSpam = urls.length > 0 && (await anyUrlBlacklisted(urls));
  if (isSpam && spamId) labels.push(spamId);

  // attach each RECIPIENT's Inbox label ONLY when NOT a draft
  if (!mailData.draft) {
    for (const addr of toTokens) {
      const rUsername = internalUsernameFromAddress(addr); // supports @bmail and @bmail.com
      if (!rUsername) continue; // external: no internal inbox label in demo
      const recipient = await User.findOne({ username: rUsername }).lean();
      if (!recipient) continue;
      const inboxLabel = await Label.findOne(
        { userId: recipient._id, name: { $regex: '^inbox$', $options: 'i' } },
        { _id: 1 }
      ).lean();
      if (inboxLabel && inboxLabel._id) {
        labels.push(inboxLabel._id);
      }
    }
  }

  // de-duplicate labels and normalize to ObjectIds (filter falsy first)
  const dedupedLabelIds = Array.from(new Set(labels.filter(Boolean).map(String))).map(
    (id) => new Types.ObjectId(id)
  );

  // persist: NOTE we now store `to` as address tokens (e.g., "bb@bmail" / "bb@bmail.com")
  const mail = await Mail.create({ ...mailData, to: toTokens, labels: dedupedLabelIds, urls });

  // If the URLs were already blacklisted, propagate Spam to all relevant mails/participants.
  if (isSpam && urls.length && spamId) {
    await tagMailsWithUrlsAsSpam(userId, mailData.from, urls, spamId);
  }

  return filterMailForOutput(mail.toObject ? mail.toObject() : mail);
}

/**
 * Get accessible mails for a user, optionally filtered by label.
 * DEMO adjustments:
 * - Inbox recipient matching uses both `${username}@bmail` and `${username}@bmail.com`.
 * - Back-compat: also matches legacy mails where `to` stored the bare username.
 */
async function getMailsForUser(username, spamLabelId, trashLabelId, labelId = null, limit = 50) {
  const internalAddrs = [`${username}@bmail`, `${username}@bmail.com`];

  const baseQuery = {
    $or: [
      // Sent by me (and I didn't delete it)
      { from: username, deletedBySender: { $ne: true } },
      // To me (not a draft, and I didn't delete it)
      {
        to: { $in: [...internalAddrs, username] }, // include both address forms + legacy bare username
        draft: false,
        deletedByRecipient: { $ne: username },
      },
    ],
  };

  const and = [];

  if (labelId) {
    // Explicit label filter
    const lid = new Types.ObjectId(labelId);
    and.push({ labels: lid });

    // Unless we are explicitly viewing Spam or Trash, exclude them
    const spamObjId = spamLabelId ? new Types.ObjectId(spamLabelId) : null;
    const trashObjId = trashLabelId ? new Types.ObjectId(trashLabelId) : null;

    const isSpamView = spamObjId && String(lid) === String(spamObjId);
    const isTrashView = trashObjId && String(lid) === String(trashObjId);

    if (!isSpamView && spamObjId) and.push({ labels: { $ne: spamObjId } });
    if (!isTrashView && trashObjId) and.push({ labels: { $ne: trashObjId } });
  } else {
    // Inbox behavior: exclude spam + trash (only if ids exist)
    if (spamLabelId) and.push({ labels: { $ne: new Types.ObjectId(spamLabelId) } });
    if (trashLabelId) and.push({ labels: { $ne: new Types.ObjectId(trashLabelId) } });
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
 * Edit a draft (owner-only) and handle draft/send label transitions.
 * DEMO adjustments:
 * - When recipients change (or draft flips), operate on address tokens in `mail.to`.
 * - For inbox label attach/remove, only consider internal recipients via internalUsernameFromAddress().
 */
async function editMailForUser(mailId, username, updates) {
  const mail = await Mail.findById(mailId);
  if (!mail) throw createError('Mail not found', { type: 'NOT_FOUND', status: 404 });
  if (mail.from !== username) {
    throw createError('User does not have access to edit this mail', { status: 403 });
  }

  // Validate & apply text / recipients
  if (updates.title != null) assertNonEmptyString('title', updates.title);
  if (updates.body != null) assertNonEmptyString('body', updates.body);
  if (updates.to != null) assertStringArray('to', updates.to);

  if (updates.title != null) mail.title = updates.title;
  if (updates.body != null) mail.body = updates.body;

  let recipientsChanged = false;

  if (updates.to != null) {
    const toTokens = tokenizeAddresses(updates.to);
    const invalid = toTokens.filter((t) => !EMAIL_RE.test(t));
    if (invalid.length) {
      throw createError(`Invalid recipient mail address: ${invalid.join(', ')}`, {
        type: 'VALIDATION',
        status: 400,
      });
    }
    mail.to = toTokens; // store addresses
    recipientsChanged = true;
  }

  // Recompute + normalize URLs if body or title changed
  if (updates.title != null || updates.body != null) {
    const raw = extractUrls(`${mail.title} ${mail.body}`);
    mail.urls = raw.map(normalizeUrl).filter(Boolean);
  }

  // Resolve sender + system labels
  const sender = await User.findOne({ username }, { _id: 1 }).lean();
  if (!sender) throw createError('Author user not found', { type: 'NOT_FOUND', status: 404 });

  const [draftsLbl, sentLbl, spamLbl] = await Promise.all([
    Label.findOne({ userId: sender._id, name: { $regex: '^drafts$', $options: 'i' } }, { _id: 1 }).lean(),
    Label.findOne({ userId: sender._id, name: { $regex: '^sent$', $options: 'i' } }, { _id: 1 }).lean(),
    Label.findOne({ userId: sender._id, name: { $regex: '^spam$', $options: 'i' } }, { _id: 1 }).lean(),
  ]);

  const draftsId = draftsLbl?._id ? String(draftsLbl._id) : null;
  const sentId = sentLbl?._id ? String(sentLbl._id) : null;
  const spamId = spamLbl?._id ? String(spamLbl._id) : null;

  const labelSet = new Set((mail.labels || []).map((id) => String(id)));
  const willBeDraft = updates.draft != null ? !!updates.draft : !!mail.draft;

  if (willBeDraft) {
    // Save as draft: ensure Drafts present, Sent absent…
    if (draftsId) labelSet.add(draftsId);
    if (sentId) labelSet.delete(sentId);
    mail.draft = true;

    // …and remove any recipient Inbox labels (drafts should not have Inbox)
    for (const addr of mail.to || []) {
      const rUsername = internalUsernameFromAddress(addr);
      if (!rUsername) continue;
      const recipient = await User.findOne({ username: rUsername }, { _id: 1 }).lean();
      if (!recipient) continue;
      const inbox = await Label.findOne(
        { userId: recipient._id, name: { $regex: '^inbox$', $options: 'i' } },
        { _id: 1 }
      ).lean();
      if (inbox && inbox._id) labelSet.delete(String(inbox._id));
    }
  } else {
    // Send: remove Drafts, add Sent, attach recipient Inbox
    if (draftsId) labelSet.delete(draftsId);
    if (sentId) labelSet.add(sentId);
    mail.draft = false;

    for (const addr of mail.to || []) {
      const rUsername = internalUsernameFromAddress(addr);
      if (!rUsername) continue;
      const recipient = await User.findOne({ username: rUsername }, { _id: 1 }).lean();
      if (!recipient) continue;
      const inbox = await Label.findOne(
        { userId: recipient._id, name: { $regex: '^inbox$', $options: 'i' } },
        { _id: 1 }
      ).lean();
      if (inbox && inbox._id) labelSet.add(String(inbox._id));
    }

    // Spam by pre-blacklisted URLs
    const urls = (mail.urls || []).map(normalizeUrl).filter(Boolean);
    if (urls.length && (await anyUrlBlacklisted(urls)) && spamId) {
      labelSet.add(spamId);
      await tagMailsWithUrlsAsSpam(sender._id.toString(), username, urls, spamId);
    }
  }

  mail.labels = Array.from(labelSet).map((id) => new Types.ObjectId(id));
  await mail.save();
  return filterMailForOutput(mail.toObject ? mail.toObject() : mail);
}

/**
 * Soft-delete for the calling user; hard-delete when no party can access.
 * DEMO adjustment: recipient match checks both `${username}@bmail` and `${username}@bmail.com`
 * (and legacy bare username).
 */
async function deleteMail(mailId, username) {
  const mail = await Mail.findById(mailId);
  if (!mail) throw createError('Mail not found', { type: 'NOT_FOUND', status: 404 });

  let changed = false;
  const internalAddrs = [`${username}@bmail`, `${username}@bmail.com`];

  if (mail.from === username && !mail.deletedBySender) {
    mail.deletedBySender = true;
    changed = true;
  }

  const toArr = Array.isArray(mail.to) ? mail.to : [];
  if (toArr.includes(internalAddrs[0]) || toArr.includes(internalAddrs[1]) || toArr.includes(username)) {
    if (!Array.isArray(mail.deletedByRecipient)) mail.deletedByRecipient = [];
    if (!mail.deletedByRecipient.includes(username)) {
      mail.deletedByRecipient.push(username);
      changed = true;
    }
  }

  // If neither side can see it anymore, hard-delete
  const visibleToSender = !mail.deletedBySender && mail.from === username;
  const visibleToAnyRecipient =
    Array.isArray(mail.to) &&
    mail.to.some(
      (u) =>
        (u === internalAddrs[0] || u === internalAddrs[1] || u === username) &&
        !mail.deletedByRecipient?.includes(username)
    );

  if (!visibleToSender && !visibleToAnyRecipient) {
    await Mail.deleteOne({ _id: mail._id });
    return;
  }

  if (changed) await mail.save();
}

function escapeRegex(s = '') {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Searches for mails accessible to `username` where title/body contains `query` (case-insensitive).
 * Mirrors the old in-memory behavior:
 *  - uses "includes" semantics via case-insensitive regex
 *  - preserves access filtering with canUserAccessMail(...)
 *  - newest first (reverse)
 *  - slice(0, limit)
 */
async function searchMailsForUser(username, query, limit = 50) {
  const q = query.trim();
  const rx = new RegExp(escapeRegex(q), 'i');
  console.log(rx);

  // We over-fetch a bit, then apply canUserAccessMail() exactly like before.
  const raw = await Mail.find(
    { $or: [{ title: { $regex: rx } }, { body: { $regex: rx } }] },
    {
      title: 1,
      body: 1,
      from: 1,
      to: 1,
      cc: 1,
      bcc: 1,
      draft: 1,
      deletedBySender: 1,
      deletedByRecipient: 1,
      createdAt: 1,
      labels: 1,
    } // include labels
  )
    .sort({ createdAt: -1 })
    .limit(Math.min(Math.max(limit * 3, limit), 300))
    .lean();

  console.log(raw);

  const visible = raw.filter((m) => canUserAccessMail(m, username));
  return visible.slice(0, limit).map(filterMailForOutput);
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
 * DEMO adjustment: recipient matching uses both `${username}@bmail` and `${username}@bmail.com`
 * (and legacy bare username). Guard against missing spamLabelId.
 */
async function tagMailsWithUrlsAsSpam(userId, username, urls, spamLabelId) {
  const norms = Array.from(new Set((urls || []).map(normalizeUrl).filter(Boolean)));
  if (!norms.length || !spamLabelId) return;

  const internalAddrs = [`${username}@bmail`, `${username}@bmail.com`];

  await Mail.updateMany(
    {
      urls: { $in: norms },
      $or: [
        { from: username, deletedBySender: { $ne: true } },
        { to: { $in: [...internalAddrs, username] }, draft: false, deletedByRecipient: { $ne: username } },
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
