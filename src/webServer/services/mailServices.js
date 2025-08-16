const { Types } = require('mongoose');
const { createError } = require('../utils/error');
const Mail = require('../models/mailsModel');
const User = require('../models/usersModel');
const { Label } = require('../models/labelsModel');
const { anyUrlBlacklisted, addUrlsToBlacklist } = require('./blacklistService');
const { findUserByUsername } = require('./userService');


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
async function filterMailForOutput(mail) {
  const output = {};
  if (mail && (mail._id || mail.id)) output.id = String(mail._id || mail.id);

  const schemaPaths = Mail.schema.paths;
  Object.keys(schemaPaths).forEach((path) => {
    const def = schemaPaths[path];
    const isPublic =
      (def.options && def.options.public) ||
      (def.caster && def.caster.options && def.caster.options.public);
    if (!isPublic || path === '_id') return;
    const value = mail[path];
    if (typeof value !== 'undefined') output[path] = value;
  });

  if (Array.isArray(mail.labels)) {
    const labels = Array.isArray(output.labels) ? output.labels : mail.labels;
    output.labels = labels.map((l) => String(l));
  }

  // Attach senderImage (try several fields, then a readable fallback)
  try {
    if (mail.from) {
      const sender = await findUserByUsername(mail.from);   // returns lean user
      const img =
        sender?.image ||           // your project uses this when users upload a photo :contentReference[oaicite:0]{index=0}
        sender?.avatarUrl ||       // alternate name (if you add it later)
        sender?.profileImage ||    // another common alias
        null;

      // Fallback so UI never gets null — initials via ui-avatars (no account needed)
      output.senderImage = img || `https://ui-avatars.com/api/?name=${encodeURIComponent(mail.from)}&background=random`;
    } else {
      output.senderImage = `https://ui-avatars.com/api/?name=?&background=random`;
    }
  } catch {
    // If lookup fails, still provide a non-null fallback
    output.senderImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(mail?.from || '?')}&background=random`;
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

  // sender always required
  assertNonEmptyString('from', mailData.from);
  if (/@/.test(mailData.from)) {
    throw createError('Sender username must not contain "@" (demo rule)', { status: 400 });
  }

  const isDraft = !!mailData.draft;

  // compute presence of fields
  const hasTitle = typeof mailData.title === 'string' && mailData.title.trim() !== '';
  const hasBody  = typeof mailData.body  === 'string' && mailData.body.trim()  !== '';

  // tokenize / validate recipients only if provided (drafts can omit)
  let toTokens = [];
  if (Array.isArray(mailData.to)) {
    const tokens = tokenizeAddresses(mailData.to);
    if (!isDraft && tokens.length === 0) {
      throw createError('to must be a non-empty array', { status: 400 });
    }
    if (tokens.length > 0) {
      const invalid = tokens.filter((t) => !EMAIL_RE.test(t));
      if (invalid.length) {
        throw createError(`Invalid recipient address(es): ${invalid.join(', ')}`, { status: 400 });
      }
      toTokens = tokens;
    }
  } else if (!isDraft) {
    throw createError('to must be a non-empty array', { status: 400 });
  }

  if (isDraft) {
    const hasTo = toTokens.length > 0;
    if (!(hasTitle || hasBody || hasTo)) {
      throw createError('Draft must include at least one of: title, body, or to', { status: 400 });
    }
    // do NOT assert non-empty strings for title/body in drafts
  } else {
    // sending: strict
    assertNonEmptyString('title', mailData.title);
    assertNonEmptyString('body',  mailData.body);
  }

  // URLs safe with missing fields
  const rawUrls = extractUrls([mailData.title, mailData.body].filter(Boolean).join(' '));
  const urls = rawUrls.map(normalizeUrl).filter(Boolean);

  // base labels (sender side)
  const labels = [];
  if (isDraft ? draftsId : sentId) labels.push(isDraft ? draftsId : sentId);

  // spam flag on sender copy
  const isSpam = urls.length > 0 && (await anyUrlBlacklisted(urls));
  if (isSpam && spamId) labels.push(spamId);

  // ✨ RECIPIENT INBOX LABELS — ONLY WHEN SENDING
  if (!isDraft && toTokens.length) {
    for (const addr of toTokens) {
      const rUsername = internalUsernameFromAddress(addr);
      if (!rUsername) continue;
      const recipient = await User.findOne({ username: rUsername }, { _id: 1 }).lean();
      if (!recipient) continue;
      const inboxLabel = await Label.findOne(
        { userId: recipient._id, name: { $regex: '^inbox$', $options: 'i' } },
        { _id: 1 }
      ).lean();
      if (inboxLabel && inboxLabel._id) labels.push(inboxLabel._id);
    }
  }

  const dedupedLabelIds = Array.from(new Set(labels.filter(Boolean).map(String))).map(
    (id) => new Types.ObjectId(id)
  );

  const mail = await Mail.create({
    ...mailData,
    to: toTokens.length ? toTokens : undefined,  // drafts can omit or be empty
    labels: dedupedLabelIds,
    urls
  });

  if (isSpam && urls.length && spamId) {
    await tagMailsWithUrlsAsSpam(userId, mailData.from, urls, spamId);
  }

  return await filterMailForOutput(mail.toObject ? mail.toObject() : mail);
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

  const outputs = await Promise.all(docs.map((m) => filterMailForOutput(m)));
  return outputs;

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
  return await filterMailForOutput(mail.toObject ? mail.toObject() : mail);
}

/**
 * Edit a draft (owner-only) and handle draft/send label transitions.
 * DEMO adjustments:
 * - When recipients change (or draft flips), operate on address tokens in `mail.to`.
 * - For inbox label attach/remove, only consider internal recipients via internalUsernameFromAddress().
 */
async function editMailForUser(mailId, username, updates) {
  const mail = await Mail.findById(mailId);
  if (!mail) throw createError('Mail not found', { status: 404 });
  if (mail.from !== username) throw createError('Forbidden', { status: 403 });

  // apply updates (drafts can set empties)
  if (typeof updates.title !== 'undefined') mail.title = updates.title;
  if (typeof updates.body  !== 'undefined') mail.body  = updates.body;

  if (typeof updates.to !== 'undefined') {
    if (Array.isArray(updates.to)) {
      const tokens = tokenizeAddresses(updates.to);
      if (tokens.length > 0) {
        const invalid = tokens.filter((t) => !EMAIL_RE.test(t));
        if (invalid.length) {
          throw createError(`Invalid recipient mail address: ${invalid.join(', ')}`, { status: 400 });
        }
      }
      mail.to = tokens; // may be [] for drafts
    } else {
      mail.to = undefined; // allowed for drafts
    }
  }

  // recompute URLs if needed
  if (typeof updates.title !== 'undefined' || typeof updates.body !== 'undefined') {
    const raw = extractUrls([mail.title, mail.body].filter(Boolean).join(' '));
    mail.urls = raw.map(normalizeUrl).filter(Boolean);
  }

  // sender (for labels lookup)
  const sender = await User.findOne({ username }, { _id: 1 }).lean();
  if (!sender) throw createError('Author user not found', { status: 404 });

  // fetch default labels for sender
  const [draftsLbl, sentLbl] = await Promise.all([
    Label.findOne({ userId: sender._id, name: { $regex: '^drafts$', $options: 'i' } }, { _id: 1 }).lean(),
    Label.findOne({ userId: sender._id, name: { $regex: '^sent$', $options: 'i' } }, { _id: 1 }).lean(),
  ]);
  const draftsId = draftsLbl?._id ? String(draftsLbl._id) : null;
  const sentId   = sentLbl?._id   ? String(sentLbl._id)   : null;

  // current labels set
  const labelSet = new Set((mail.labels || []).map((id) => String(id)));

  // final draft state after update
  const willBeDraft = typeof updates.draft !== 'undefined' ? !!updates.draft : !!mail.draft;

  // helper to find/remove/add inbox labels per current recipients
  async function addRecipientInboxLabels() {
    if (!Array.isArray(mail.to) || mail.to.length === 0) return;
    for (const addr of mail.to) {
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
  }
  async function removeRecipientInboxLabels() {
    if (!Array.isArray(mail.to) || mail.to.length === 0) return;
    for (const addr of mail.to) {
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
  }

  if (willBeDraft) {
    // staying/going to draft: no inbox labels
    if (draftsId) labelSet.add(draftsId);
    if (sentId)   labelSet.delete(sentId);
    await removeRecipientInboxLabels();
    mail.draft = true;
  } else {
    // switching to send: enforce strict required fields
    const hasTitle = typeof mail.title === 'string' && mail.title.trim() !== '';
    const hasBody  = typeof mail.body  === 'string' && mail.body.trim()  !== '';
    const hasTo    = Array.isArray(mail.to) && mail.to.length > 0;
    if (!(hasTitle && hasBody && hasTo)) {
      throw createError('Cannot send: title, body and at least one recipient are required', { status: 400 });
    }

    if (draftsId) labelSet.delete(draftsId);
    if (sentId)   labelSet.add(sentId);

    // ✨ ensure recipients’ INBOX labels are present on send
    await addRecipientInboxLabels();

    mail.draft = false;
  }

  mail.labels = Array.from(labelSet).map((id) => new Types.ObjectId(id));
  await mail.save();
  return await filterMailForOutput(mail.toObject ? mail.toObject() : mail);
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
  const slice = visible.slice(0, limit);
  const outputs = await Promise.all(slice.map((m) => filterMailForOutput(m)));
  return outputs;

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

  return await filterMailForOutput(mail.toObject ? mail.toObject() : mail);
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

  return await filterMailForOutput(mail.toObject ? mail.toObject() : mail);
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
