const { Types } = require('mongoose');
const { createError } = require('../utils/error');
const Mail = require('../models/mailsModel');
const User = require('../models/usersModel');
const { Label } = require('../models/labelsModel');
const { anyUrlBlacklisted, addUrlsToBlacklist, isUrlBlacklisted, removeUrlsFromBlacklist } = require('./blacklistService');
const { findUserByUsername } = require('./userService');


/** requires local@domain.tld */
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/**
 * Convert an internal address to a username.
 * Supports `user@bmail` and `user@bmail.com`.
 *
 * @param {string} addr - Email-like address.
 * @returns {string|null} Username if it’s an internal address; otherwise null.
 */
function internalUsernameFromAddress(addr) {
  const m = /^([^@\s]+)@bmail(?:\.com)?$/i.exec(String(addr || ''));
  return m ? m[1] : null;
}

/**
 * Tokenize recipients from mixed delimiters.
 * Splits on spaces, commas, and semicolons; trims and filters empties.
 *
 * @param {string[]} toArray - Original recipients array (possibly messy).
 * @returns {string[]} Clean list of recipient tokens.
 */
function tokenizeAddresses(toArray) {
  if (!Array.isArray(toArray)) return [];
  return toArray
    .flatMap((s) => String(s).split(/[\s,;]+/g))
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Require a non-empty string.
 * Mirrors label/user validation style.
 *
 * @param {string} field - Field name for error message.
 * @param {any} value - Value to check.
 * @returns {void}
 * @throws {Error} VALIDATION (400) if value is not a trimmed non-empty string.
 */
function assertNonEmptyString(field, value) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw createError(`${field} must be a non-empty string`, { type: 'VALIDATION', status: 400 });
  }
}

/**
 * Require an array of non-empty strings.
 *
 * @param {string} field - Field name for error message.
 * @param {any[]} arr - Candidate array.
 * @returns {void}
 * @throws {Error} VALIDATION (400) if not an array or elements are empty strings.
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
 * Pull out URLs from text (title/body).
 * Keeps the regex simple and robust enough for common cases.
 *
 * @param {string} text - Text to scan.
 * @returns {string[]} Array of raw URL-like strings (possibly unnormalized).
 */
function extractUrls(text) {
  const urlRe = /(?:https?:\/\/)?(?:www\.)?(?:[a-z0-9-]+\.)+[a-z0-9]{2,}(?:\/[^\s<>"'()[\]{}]*)?/ig;
  return text.match(urlRe) || [];
}

/**
 * Normalize a URL for matching.
 * Lowercases, trims, and strips a trailing slash.
 *
 * @param {string} u - Raw URL string.
 * @returns {string|null} Normalized URL, or null if input isn’t a string/empty.
 */
function normalizeUrl(u) {
  if (typeof u !== 'string') return null;
  const s = u.trim().toLowerCase();
  if (!s) return null;
  return s.endsWith('/') ? s.slice(0, -1) : s;
}

/**
 * Check a mail’s URL list against the bloomfilter.
 * Fast path uses a single “any blacklisted?” check, then confirms per-URL.
 *
 * @param {object} mailOrObj - Mail doc/object with `{ urls: string[] }`.
 * @returns {Promise<{hasTaggedUrl:boolean, taggedUrls:string[]}>} Flags and matched URLs.
 */
async function scanMail(mailOrObj) {
  const urls = Array.from(new Set(((mailOrObj?.urls) || [])
    .map(normalizeUrl)
    .filter(Boolean)));

  if (!urls.length) {
    return { hasTaggedUrl: false, taggedUrls: [] };
  }

  // fast boolean using existing helper
  console.log( "checking if any url is blacklisted " + urls)
  const hasTaggedUrl = await anyUrlBlacklisted(urls);
  console.log(hasTaggedUrl)

  // if positive, compute the exact set
  let taggedUrls = [];
  if (hasTaggedUrl) {
    // check each URL (small lists only; mail.urls shouldn’t be huge)
    const checked = await Promise.all(
      urls.map(async (u) => (await isUrlBlacklisted(u)) ? u : null)
    );
    taggedUrls = checked.filter(Boolean);
  }
  return { hasTaggedUrl, taggedUrls };
}


/**
 * Make a safe DTO from a mail document based on schema `public` flags.
 * Always returns an `id` (string) derived from `_id`.
 *
 * @param {object} mail - Mongoose doc or plain object.
 * @returns {Promise<object>} Public-safe DTO with `id`, public fields, and `userImage`.
 */
async function filterMailForOutput(mail) {
  const output = {};
  if (mail && (mail._id || mail.id)) output.id = String(mail._id || mail.id);

  // project only fields marked `public` in the Mail schema
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

  // normalize label ids to strings (if present)
  if (Array.isArray(mail.labels)) {
    const labels = Array.isArray(output.labels) ? output.labels : mail.labels;
    output.labels = labels.map((l) => String(l));
  }
try {
  if (mail.from) {
    // this already applies the same projection as user service
    const username = mail.from
    const sender = await User.findOne({ username }).lean();
    // always include the key (mirror user service behavior)
    output.from = `${mail.from}@bmail.com`;
    output.userImage = sender?.image ?? null;
  } else {
    output.userImage = null;
  }
} catch {
  output.userImage = null;
}
  return output;
}


/**
 * Check if a user can access a mail.
 * Sender sees their own (unless soft-deleted); recipients see non-drafts not soft-deleted for them.
 *
 * @param {object} mail - Mail doc/object.
 * @param {string} username - Current viewer’s username.
 * @returns {boolean} True if accessible by the user, false otherwise.
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
 * Create (send or draft) a mail and set system labels.
 * Extracts URLs and marks spam for non-drafts by consulting the bloomfilter.
 *
 * @param {object} mailData - `{ from, to?, title?, body?, draft? }` payload.
 * @param {{userId:any, system:{spamId?:any, sentId?:any, draftsId?:any}}} context - IDs for system labels.
 * @returns {Promise<object>} Public-safe mail DTO after creation.
 * @throws {Error} VALIDATION (400) for bad input; other create/DB errors as thrown.
 */
async function buildMail(mailData, { userId, system }) {
  const { spamId, sentId, draftsId } = system || {};

  // validation (keep your existing asserts)
  assertNonEmptyString('from', mailData.from);
  if (/@/.test(mailData.from)) {
    throw createError('Sender username must not contain "@"', { status: 400 });
  }
  const isDraft = mailData.draft;

  // tokenize recipients
  const toTokens = tokenizeAddresses(mailData.to);

  // enforce that every address matches EMAIL_RE
  const invalid = toTokens.filter((addr) => !EMAIL_RE.test(addr));
  if (invalid.length) {
    throw createError(`Invalid recipient mail address: ${invalid.join(', ')}`, {
      type: 'VALIDATION',
      status: 400
    });
  }



  // extract & normalize URLs (always store, even for drafts)
  const rawUrls = extractUrls([mailData.title, mailData.body].filter(Boolean).join(' '));
  const urls = rawUrls.map(normalizeUrl).filter(Boolean);

  // base labels (sender side: sent/drafts)
  const labels = [];
  if (isDraft ? draftsId : sentId) labels.push(isDraft ? draftsId : sentId);

  // spam check ONLY for non-drafts
  let isSpam = false;
  if (!isDraft && urls.length) {
    const result = await scanMail({ urls });
    isSpam = result.hasTaggedUrl;
  }
  if (!isDraft && isSpam && spamId) labels.push(spamId);

  // recipient "inbox" labeling for non-drafts
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

  const dedupedLabelIds = Array.from(new Set(labels.filter(Boolean).map(String)))
    .map((id) => new Types.ObjectId(id));

  const mail = await Mail.create({
    ...mailData,
    to: toTokens.length ? toTokens : undefined, // drafts can omit/be empty
    labels: dedupedLabelIds,
    urls
  });

  // propagate spam label to matching mails ONLY for non-drafts
  if (!isDraft && isSpam && urls.length && spamId) {
    await tagMailsWithUrlsAsSpam(userId, mailData.from, urls, spamId);
  }

  return await filterMailForOutput(mail.toObject ? mail.toObject() : mail);
}

/**
 * Update Spam labels across all mails for a user.
 * Adds/removes Spam based on blacklist hits; ignores drafts.
 *
 * @param {Types.ObjectId|string} userId - Owner of the Spam label.
 * @param {string} username - Username for access scoping.
 * @returns {Promise<{added:number, removed:number}>} Count of label changes.
 * @throws {Error} VALIDATION (400) if userId/username missing; DB errors as thrown.
 */
async function updateMailsSpamLabel(userId, username) {
  if (!userId) throw createError('userId is required', { status: 400 });
  if (!username) throw createError('username is required', { status: 400 });

  const spamLabel = await Label.findOne(
    { userId: new Types.ObjectId(String(userId)), name: { $regex: '^spam$', $options: 'i' } },
    { _id: 1 }
  ).lean();

  if (!spamLabel?._id) return { added: 0, removed: 0 };
  const spamId = new Types.ObjectId(spamLabel._id);

  // candidate mails accessible to user, with any URLs, and not drafts
  const internalAddrs = [`${username}@bmail`, `${username}@bmail.com`];

  const candidates = await Mail.find(
    {
      draft: { $ne: true },
      urls: { $exists: true, $ne: [] },
      $or: [
        { from: username, deletedBySender: { $ne: true } },
        { to: { $in: [...internalAddrs, username] }, deletedByRecipient: { $ne: username } },
      ],
    },
    { _id: 1, urls: 1, labels: 1 }
  ).lean();

  const toAdd = [];
  const toRemove = [];

  for (const m of candidates) {
    const urls = Array.from(new Set((m.urls || []).map(normalizeUrl).filter(Boolean)));
    const hasTagged = urls.length ? await anyUrlBlacklisted(urls) : false;
    const hasSpam = (m.labels || []).some((id) => String(id) === String(spamId));

    if (hasTagged && !hasSpam) toAdd.push(m._id);
    if (!hasTagged && hasSpam) toRemove.push(m._id);
  }

  let added = 0;
  let removed = 0;

  if (toAdd.length) {
    const res = await Mail.updateMany(
      { _id: { $in: toAdd } },
      { $addToSet: { labels: spamId } }
    );
    added = res?.modifiedCount || res?.nModified || 0;
  }

  if (toRemove.length) {
    const res = await Mail.updateMany(
      { _id: { $in: toRemove } },
      { $pull: { labels: spamId } }
    );
    removed = res?.modifiedCount || res?.nModified || 0;
  }

  return { added, removed };
}

/**
 * Get mails visible to a user, with optional label filter.
 * Spam/Trash views are special-cased; normal views exclude them.
 *
 * @param {string} username - Current user.
 * @param {string|null} spamLabelId - Spam label ObjectId string (optional).
 * @param {string|null} trashLabelId - Trash label ObjectId string (optional).
 * @param {string|null} labelId - Label to filter on (optional).
 * @param {number} [limit=50] - Max results.
 * @returns {Promise<object[]>} Public-safe mail DTOs sorted by newest first.
 */
async function getMailsForUser(username, spamLabelId, trashLabelId, labelId = null, limit = 50) {
  const internalAddrs = [`${username}`, `${username}@bmail`, `${username}@bmail.com`];

  // figure out which label is being viewed (by name)
  let viewLabelName = null;
  if (labelId) {
    const lab = await Label.findById(labelId, { name: 1 }).lean();
    viewLabelName = (lab?.name || '').toLowerCase();
  }

  const spamObjId  = spamLabelId  ? new Types.ObjectId(spamLabelId)  : null;
  const trashObjId = trashLabelId ? new Types.ObjectId(trashLabelId) : null;

  // base access scope (who can see the mail)
  const accessScope = {
    $or: [
      { from: username },
      { to: { $in: internalAddrs }, draft: false },
    ],
  };

  const and = [accessScope];

  if (viewLabelName === 'trash' && trashObjId) {
    // TRASH view: show only mails that HAVE trash (even if they also have spam)
    and.push({ labels: trashObjId });
    // no soft-delete filters here — explicit Trash view
  } else if (viewLabelName === 'spam' && spamObjId) {
    // SPAM view: show only mails that HAVE spam
    and.push({ labels: spamObjId });
    // EXCLUDE mails that are also in Trash
    if (trashObjId) and.push({ labels: { $ne: trashObjId } });
    // no soft-delete filters here — explicit Spam view
  } else {
    // Inbox / Starred / any other label (or no label)
    if (labelId && viewLabelName) {
      and.push({ labels: new Types.ObjectId(labelId) });
    }

    // Exclude spam and trash from these views
    if (spamObjId)  and.push({ labels: { $ne: spamObjId } });
    if (trashObjId) and.push({ labels: { $ne: trashObjId } });

    // Apply soft-delete visibility for the requesting user
    and.push({
      $or: [
        { from: username, deletedBySender: { $ne: true } },
        {
          to: { $in: internalAddrs },
          draft: false,
          deletedByRecipient: { $ne: username },
        },
      ],
    });
  }

  const query = { $and: and };

  const docs = await Mail.find(query)
    .sort({ createdAt: -1 })
    .limit(Math.max(1, Number(limit) || 50))
    .lean();

  const outputs = await Promise.all(docs.map((m) => filterMailForOutput(m)));
  return outputs;
}

/**
 * Read a single mail with access enforcement.
 * Returns a public-safe DTO if found/accessible.
 *
 * @param {string} id - Mail ObjectId string.
 * @param {string} username - Current user.
 * @returns {Promise<object>} Public-safe mail DTO.
 * @throws {Error} NOT_FOUND (404) if missing; 403 if user cannot access.
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
 * Edit a draft and handle draft→send transitions.
 * Also manages recipient inbox labels and optional spam scan on send.
 *
 * @param {string} mailId - Mail ObjectId string.
 * @param {string} username - Sender username (must match `from`).
 * @param {object} updates - Partial `{ title?, body?, to?, draft? }`.
 * @returns {Promise<object>} Public-safe mail DTO after update.
 * @throws {Error} 404 if missing, 403 if not owner, 400 if sending with incomplete fields.
 */
async function editMailForUser(mailId, username, updates) {
  const mail = await Mail.findById(mailId);
  if (!mail) throw createError('Mail not found', { status: 404 });
  if (mail.from !== username) throw createError('Forbidden', { status: 403 });

  const wasDraft = !!mail.draft;

  // apply updates (drafts can set empties)
  if (typeof updates.title !== 'undefined') mail.title = updates.title;
  if (typeof updates.body  !== 'undefined') mail.body  = updates.body;

  if (typeof updates.to !== 'undefined') {
  if (typeof updates.to !== 'undefined') {
  if (Array.isArray(updates.to)) {
    const tokens = tokenizeAddresses(updates.to);

    // enforce that every address matches EMAIL_RE
    const invalid = tokens.filter((addr) => !EMAIL_RE.test(addr));
    if (invalid.length) {
      throw createError(`Invalid recipient mail address: ${invalid.join(', ')}`, {
        type: 'VALIDATION',
        status: 400
      });
    }

    mail.to = tokens; // safe array
  } else {
    mail.to = undefined; // allowed for drafts
  }
  }}



  // recompute URLs if title/body changed (always store URLs)
  if (typeof updates.title !== 'undefined' || typeof updates.body !== 'undefined') {
    const raw = extractUrls([mail.title, mail.body].filter(Boolean).join(' '));
    mail.urls = raw.map(normalizeUrl).filter(Boolean);
  }

  // sender (for labels lookup)
  const sender = await User.findOne({ username }, { _id: 1 }).lean();
  if (!sender) throw createError('Author user not found', { status: 404 });

  // fetch default labels for sender
  const [draftsLbl, sentLbl, spamLbl] = await Promise.all([
    Label.findOne({ userId: sender._id, name: { $regex: '^drafts$', $options: 'i' } }, { _id: 1 }).lean(),
    Label.findOne({ userId: sender._id, name: { $regex: '^sent$',   $options: 'i' } }, { _id: 1 }).lean(),
    Label.findOne({ userId: sender._id, name: { $regex: '^spam$',   $options: 'i' } }, { _id: 1 }).lean(),
  ]);
  const draftsId = draftsLbl?._id ? String(draftsLbl._id) : null;
  const sentId   = sentLbl?._id   ? String(sentLbl._id)   : null;
  const spamId   = spamLbl?._id   ? String(spamLbl._id)   : null;

  // current labels set
  const labelSet = new Set((mail.labels || []).map((id) => String(id)));

  // final draft state after update
  const willBeDraft = typeof updates.draft !== 'undefined' ? !!updates.draft : !!mail.draft;

  // helpers to add/remove recipient inbox labels
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
    // staying/going to draft: no inbox labels; DO NOT scan for spam
    if (draftsId) labelSet.add(draftsId);
    if (sentId)   labelSet.delete(sentId);
    await removeRecipientInboxLabels();
    mail.draft = true;

    mail.labels = Array.from(labelSet).map((id) => new Types.ObjectId(id));
    await mail.save();
    return await filterMailForOutput(mail.toObject ? mail.toObject() : mail);
  }

  // switching to send: enforce required fields
  const hasTitle = typeof mail.title === 'string' && mail.title.trim() !== '';
  const hasBody  = typeof mail.body  === 'string' && mail.body.trim()  !== '';
  const hasTo    = Array.isArray(mail.to) && mail.to.length > 0;
  if (!(hasTitle && hasBody && hasTo)) {
    throw createError('Cannot send: title, body and at least one recipient are required', { status: 400 });
  }

  if (draftsId) labelSet.delete(draftsId);
  if (sentId)   labelSet.add(sentId);
  await addRecipientInboxLabels();
  mail.draft = false;

  // ✨ spam scan ONLY on transition draft -> send
  let isSpamOnSend = false;
  if (wasDraft && !willBeDraft && Array.isArray(mail.urls) && mail.urls.length) {
    const { hasTaggedUrl } = await scanMail(mail);
    isSpamOnSend = !!hasTaggedUrl;
    if (isSpamOnSend && spamId) {
      labelSet.add(String(spamId));
    }
  }

  mail.labels = Array.from(labelSet).map((id) => new Types.ObjectId(id));
  await mail.save();

  // propagate spam labels (no blacklist changes) ONLY if draft -> send and URLs were tagged
  if (wasDraft && !willBeDraft && isSpamOnSend && spamId && Array.isArray(mail.urls) && mail.urls.length) {
    await tagMailsWithUrlsAsSpam(sender._id, username, mail.urls, spamId);
  }

  return await filterMailForOutput(mail.toObject ? mail.toObject() : mail);
}

/**
 * Soft-delete a mail for the calling user (Trash).
 * If it’s already in Trash for this user, hard-delete it.
 *
 * @param {string} mailId - Mail ObjectId string.
 * @param {string} username - Current user.
 * @returns {Promise<void>} Resolves when delete/flagging is done.
 * @throws {Error} 404 if mail/user not found.
 */
async function deleteMail(mailId, username) {
  const mail = await Mail.findById(mailId);
  if (!mail) throw createError('Mail not found', { type: 'NOT_FOUND', status: 404 });

  // fetch this user's TRASH label
  const me = await User.findOne({ username }, { _id: 1 }).lean();
  if (!me) throw createError('User not found', { status: 404 });

  const trashLabel = await Label.findOne(
    { userId: me._id, name: { $regex: '^trash$', $options: 'i' } },
    { _id: 1 }
  ).lean();

  // if the user doesn't have a Trash label, just soft-delete visibility and return
  const trashId = trashLabel?._id ? new Types.ObjectId(trashLabel._id) : null;

  const alreadyHasTrash = !!(trashId && (mail.labels || []).some((id) => String(id) === String(trashId)));

  if (alreadyHasTrash) {
    // Rule: if already tagged as trash and trash request -> hard delete the mail
    // (do NOT remove spam label; mail is being removed entirely)
    await Mail.deleteOne({ _id: mail._id });
    return;
  }

  // First-time "trash" → attach Trash label and mark soft-deleted for this user
  let changed = false;

  if (trashId) {
    if (!Array.isArray(mail.labels)) mail.labels = [];
    mail.labels.push(trashId);
    changed = true;
  }

  // mark soft-deleted flags for the requesting user
  const internalAddrs = [`${username}`, `${username}@bmail`, `${username}@bmail.com`];

  if (mail.from === username && !mail.deletedBySender) {
    mail.deletedBySender = true;
    changed = true;
  }

  if (Array.isArray(mail.to) && mail.to.some((u) => internalAddrs.includes(u))) {
    if (!Array.isArray(mail.deletedByRecipient)) mail.deletedByRecipient = [];
    if (!mail.deletedByRecipient.includes(username)) {
      mail.deletedByRecipient.push(username);
      changed = true;
    }
  }

  if (changed) await mail.save();
}

/**
 * Escape a string for use inside a regex.
 *
 * @param {string} s - Raw string.
 * @returns {string} Escaped version safe for `new RegExp`.
 */
function escapeRegex(s = '') {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Search mails visible to a user by substring match.
 * Case-insensitive search over title/body; preserves visibility rules.
 *
 * @param {string} username - Current user.
 * @param {string} query - Raw search string.
 * @param {number} [limit=50] - Max number of results (caps internal fetch).
 * @returns {Promise<object[]>} Public-safe mail DTOs.
 * @throws {Error} DB errors as thrown; empty query handled by caller/controller.
 */
async function searchMailsForUser(username, query, limit = 50) {
  const q = query.trim();
  const rx = new RegExp(escapeRegex(q), 'i');


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


  const visible = raw.filter((m) => canUserAccessMail(m, username));
  const slice = visible.slice(0, limit);
  const outputs = await Promise.all(slice.map((m) => filterMailForOutput(m)));
  return outputs;

}

/**
 * Attach a label to a mail and optionally propagate Spam effects.
 * If the label is Spam, add mail URLs to the blacklist and update other mails.
 *
 * @param {string} mailId - Mail ObjectId string.
 * @param {string} labelId - Label ObjectId string.
 * @param {string} username - Current user (for access).
 * @returns {Promise<object>} Updated public-safe mail DTO.
 * @throws {Error} 404 if mail missing, 403 if no access, validation/db errors as thrown.
 */
async function addLabelToMail(mailId, labelId, username) {
  const mail = await Mail.findById(mailId);
  if (!mail) throw createError('Mail not found', { type: 'NOT_FOUND', status: 404 });
  if (!canUserAccessMail(mail, username)) {
    throw createError('User does not have access to this mail', { status: 403 });
  }

  const lId = new Types.ObjectId(labelId);

  // normal attach
  if (!mail.labels.map(String).includes(String(lId))) {
    mail.labels.push(lId);
    await mail.save();
  }

  // spam-specific side effects
  const labelDoc = await Label.findById(lId, { _id: 1, name: 1, userId: 1 }).lean();
  const isSpam = !!labelDoc && /^spam$/i.test(labelDoc.name);
  if (isSpam) {
    const urls = Array.from(new Set((mail.urls || []).map(normalizeUrl).filter(Boolean)));
    if (urls.length) {
      console.log("tagging urls as spam" + urls)
      await addUrlsToBlacklist(urls); // on tag attach — add URLs to blacklist
    }
    // propagate for this label's owner (spam is per user)
    await updateMailsSpamLabel(labelDoc.userId, username);
  }

  return await filterMailForOutput(mail.toObject ? mail.toObject() : mail);
}

/**
 * Detach a label from a mail and optionally propagate Spam effects.
 * If the label is Spam, remove URLs from blacklist and refresh Spam labels.
 *
 * @param {string} mailId - Mail ObjectId string.
 * @param {string} labelId - Label ObjectId string.
 * @param {string} username - Current user (for access).
 * @returns {Promise<object>} Updated public-safe mail DTO.
 * @throws {Error} 404 if mail missing, 403 if no access, validation/db errors as thrown.
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

  // spam-specific side effects
  const labelDoc = await Label.findById(lId, { _id: 1, name: 1, userId: 1 }).lean();
  const isSpam = !!labelDoc && /^spam$/i.test(labelDoc.name);
  if (isSpam) {
    const urls = Array.from(new Set((mail.urls || []).map(normalizeUrl).filter(Boolean)));
    if (urls.length) {
      await removeUrlsFromBlacklist(urls); // on tag detach — remove URLs from blacklist
    }
    await updateMailsSpamLabel(labelDoc.userId, username);
  }

  return await filterMailForOutput(mail.toObject ? mail.toObject() : mail);
}

/**
 * Add a user’s Spam label to all of their mails matching any URL in the list.
 * Skips drafts; does nothing if list is empty or spamLabelId is missing.
 *
 * @param {string|import('mongoose').Types.ObjectId} userId - Owner of the Spam label.
 * @param {string} username - Username for access scoping.
 * @param {string[]} urls - URLs (any case) to match; will be normalized.
 * @param {string|import('mongoose').Types.ObjectId} spamLabelId - Spam label id.
 * @returns {Promise<{matched:number, tagged:number}>} Candidate count and added count.
 */
async function tagMailsWithUrlsAsSpam(userId, username, urls, spamLabelId) {
  const list = Array.from(new Set((urls || []).map(normalizeUrl).filter(Boolean)));
  if (!list.length || !spamLabelId) return { matched: 0, tagged: 0 };

  const spamObjId = new Types.ObjectId(spamLabelId);
  const internalAddrs = [`${username}`, `${username}@bmail`, `${username}@bmail.com`];

  // Candidate mails that belong to this user's scope, contain any URL, and are NOT drafts
  const candidates = await Mail.find(
    {
      draft: { $ne: true },                // <-- skip drafts
      urls: { $in: list },
      $or: [
        { from: username },
        { to: { $in: internalAddrs }, draft: false },
      ],
    },
    { _id: 1, labels: 1 }
  ).lean();

  const toAdd = [];
  for (const m of candidates) {
    const hasSpam = (m.labels || []).some((id) => String(id) === String(spamObjId));
    if (!hasSpam) toAdd.push(m._id);
  }

  let tagged = 0;
  if (toAdd.length) {
    const res = await Mail.updateMany(
      { _id: { $in: toAdd } },
      { $addToSet: { labels: spamObjId } }
    );
    tagged = res?.modifiedCount || res?.nModified || 0;
  }
  return { matched: candidates.length, tagged };
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
  extractUrls,
  scanMail,
  updateMailsSpamLabel,
};
