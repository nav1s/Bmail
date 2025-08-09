// services/mailServices.js
const { Types } = require('mongoose');
const { createError } = require('../utils/error');
const Mail = require('../models/mailsModel');
const { Label } = require('../models/labelsModel');


/**
 * Filters a Mail document to return only the public-facing fields.
 * @param {import('../models/mailsModel').MailDoc} mail
 * @returns {object} filtered mail object
 */
function filterMailForOutput(mail) {
  const output = {};
  const schemaPaths = Mail.schema.paths;

  Object.keys(schemaPaths).forEach(path => {
    if (schemaPaths[path].options.public) {
      output[path === '_id' ? 'id' : path] =
        path === '_id' ? mail._id.toString() : mail[path];
    }
  });

  // Ensure labels are strings
  if (output.labels) {
    output.labels = output.labels.map(l => l.toString());
  }

  return output;
}

/**
 * Checks if a given user can access a mail.
 * @param {import('../models/mailsModel').MailDoc} mail
 * @param {string} username
 * @returns {boolean}
 */
function canUserAccessMail(mail, username) {
  return (
    (mail.from === username && !mail.deletedBySender) ||
    (mail.to.includes(username) && !mail.draft && !mail.deletedByRecipient.includes(username))
  );
}

/**
 * Extracts all URLs from a text string.
 * @param {string} text
 * @returns {string[]} array of URLs
 */
function extractUrls(text) {
  const re = /\bhttps?:\/\/(?:www\.)?[a-zA-Z0-9\-]+\.[a-zA-Z]{2,}(?:\.[a-zA-Z]{2,})?(?:\/[^\s]*)?\b/g;
  return text.match(re) || [];
}

/**
 * Creates and saves a new mail.
 * @param {object} mailData - Must contain from, to, title, body, draft, labels
 * @returns {Promise<object>} created mail
 */
async function buildMail(mailData) {
  try {
    const urls = extractUrls(`${mailData.title} ${mailData.body}`);
    const mail = await Mail.create({ ...mailData, urls });
    return filterMailForOutput(mail);
  } catch (err) {
    throw err;
  }
}

/**
 * Retrieves mails for a user with spam/trash exclusion logic.
 *
 * @param {string} username - User's username.
 * @param {string} spamLabelId - Label ObjectId string for "spam".
 * @param {string} trashLabelId - Label ObjectId string for "trash".
 * @param {string|null} [labelId=null] - Optional label ObjectId string to filter by.
 * @param {number} [limit=50] - Max number of mails to retrieve.
 * @returns {Promise<object[]>}
 */
async function getMailsForUser(username, spamLabelId, trashLabelId, labelId = null, limit = 50) {
  try {
    const and = [
      {
        $or: [
          { from: username, deletedBySender: { $ne: true } },
          { to: username, draft: false, deletedByRecipient: { $ne: username } },
        ],
      },
    ];

    const spamObjId = new Types.ObjectId(spamLabelId);
    const trashObjId = new Types.ObjectId(trashLabelId);

    if (labelId) {
      const labelObjId = new Types.ObjectId(labelId);

      if (labelObjId.equals(spamObjId)) {
        // Show ONLY spam
        and.push({ labels: spamObjId });
      } else if (labelObjId.equals(trashObjId)) {
        // Show ONLY trash
        and.push({ labels: trashObjId });
      } else {
        // Show ONLY the requested label, but still exclude spam/trash
        and.push({ labels: labelObjId });
        and.push({ labels: { $nin: [spamObjId, trashObjId] } });
      }
    } else {
      // No label filter → exclude spam & trash
      and.push({ labels: { $nin: [spamObjId, trashObjId] } });
    }

    const mails = await Mail.find({ $and: and })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return mails.map(filterMailForOutput);
  } catch (err) {
    throw err;
  }
}



/**
 * Finds a mail by its ID.
 * @param {string} id - The ObjectId string of the mail.
 * @returns {Promise<object>} - The found mail (plain object).
 * @throws {Error} If no mail is found or the ID is invalid.
 */
async function findMailById(id) {
  try {
    const mail = await Mail.findById(id).lean();
    if (!mail) {
      throw createError('Mail not found', { type: 'NOT_FOUND', status: 404 });
    }
    return mail;
  } catch (err) {
    throw err;
  }
}


/**
 * Edits an existing mail.
 * Only mails currently marked as draft can be edited.
 *
 * @param {string} mailId
 * @param {Partial<import('../models/mailsModel').MailDoc>} updates
 * @returns {Promise<object>} Updated mail
 * @throws {Error} NOT_FOUND if the mail doesn't exist or isn't a draft
 */
async function editMail(mailId, updates) {
  try {
    const mail = await Mail.findById(mailId, { draft: 1 }).lean();
    if (!mail || !mail.draft) {
      throw createError('Mail not found', { type: 'NOT_FOUND', status: 404 });
    }

    if (updates.title || updates.body) {
      updates.urls = extractUrls(`${updates.title || ''} ${updates.body || ''}`);
    }

    const updated = await Mail.findByIdAndUpdate(mailId, updates, { new: true }).lean();
    return filterMailForOutput(updated);
  } catch (err) {
    throw err;
  }
}




/**
 * Deletes or marks a mail as deleted for a user.
 * @param {string} mailId
 * @param {string} username
 * @returns {Promise<object|null>} deleted mail details or null
 */
async function deleteMail(mailId, username) {
  try {
    const mail = await Mail.findById(mailId);
    if (!mail) {
      throw createError('Mail not found', { type: 'NOT_FOUND', status: 404 });
    }
    
    // If draft delete
    if (mail.draft && mail.from === username) {
      await mail.deleteOne();
      return;
    }

    // Delete by sender
    if (mail.from === username) {
      mail.deletedBySender = true;
    }

    // Delete by recepient
    if (mail.to.includes(username) && !mail.deletedByRecipient.includes(username)) {
      mail.deletedByRecipient.push(username);
    }

    const allRecipientsDeleted = mail.deletedByRecipient.length === mail.to.length;
    // All recepients deleted mail
    if (mail.deletedBySender && allRecipientsDeleted) {
      await mail.deleteOne();
      return;
    }

    await mail.save();
    return;
  } catch (err) {
    throw err;
  }
}

/**
 * Searches mails for a user using a text search.
 * @param {string} username
 * @param {string} searchString
 * @param {number} [limit=50] - Maximum number of results to return.
 * @returns {Promise<object[]>}
 */
async function searchMailsForUser(username, searchString, limit = 50) {
  try {
    const mails = await Mail.find({
      $text: { $search: searchString },
      $or: [
        { from: username, deletedBySender: { $ne: true } },
        { to: username, draft: false, deletedByRecipient: { $ne: username } }
      ]
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return mails.map(filterMailForOutput);
  } catch (err) {
    throw err;
  }
}

/**
 * Adds a label to a mail.
 * @param {string} mailId - The ID of the mail.
 * @param {string} labelId - The ID of the label to add.
 * @param {string} username - The acting username (for access checks).
 * @returns {Promise<object>} Updated mail.
 * @throws {Error} If mail not found, user has no access, label not attachable, or label already attached.
 */
async function addLabelToMail(mailId, labelId, username) {
  try {
    // Fetch the mail and check access
    const mail = await Mail.findById(mailId);
    if (!mail) {
      throw createError('Mail not found', { status: 404 });
    }

    if (canUserAccessMail(mail, username) === false) {
      throw createError('User does not have access to this mail', { status: 403 });
    }

    // Fetch the label and check if attachable
    const label = await Label.findById(labelId).lean();
    if (!label) {
      throw createError('Label not found', { status: 404 });
    }
    if (!label.attachable) {
      throw createError('This label cannot be manually attached', { type: 'VALIDATION', status: 400 });
    }

    // Check if label is already attached
    if ((mail.labels || []).some(l => l.toString() === labelId)) {
      throw createError('Label already attached to this mail', { status: 400 });
    }

    console.log(`Adding label ${labelId} to mail ${mailId}`);
    console.log(`Mail before adding label:`, mail.toObject ? mail.toObject() : mail);

    const updated = await Mail.findByIdAndUpdate(
      mailId,
      { $addToSet: { labels: new Types.ObjectId(labelId) } },
      { new: true }
    ).lean();

    return filterMailForOutput(updated);
  } catch (err) {
    throw err;
  }
}


/**
 * Removes a label from a mail for a given user.
 * @param {string} mailId - The ID of the mail (ObjectId string).
 * @param {string} labelId - The ID of the label to remove (ObjectId string).
 * @param {string} username - The acting username (for access checks).
 * @returns {Promise<object>} Updated mail (filtered for output).
 * @throws {Error} 404 if mail not found, 403 if no access, 404 if label not on mail.
 */
async function removeLabelFromMail(mailId, labelId, username) {
  try {
    const mail = await Mail.findById(mailId);
    // Check for mail existance and user access
    if (!mail) {
      throw createError('Mail not found', { status: 404 });
    }

    if (canUserAccessMail(mail, username) === false) {
      throw createError('User does not have access to this mail', { status: 403 });
    }

    // Check if label exists in DB
    const label = await Label.findById(labelId).lean();
    if (!label) {
      throw createError('Label not found', { status: 404 });
    }

    // Check if label is attached to this mail
    if (!(mail.labels || []).some(l => l.toString() === labelId)) {
      throw createError('Label not found on this mail', { status: 404 });
    }

    // Check if label can be removed
    if (!label.attachable) {
      throw createError('This label cannot be manually removed', { type: 'VALIDATION', status: 400 });
    }

    console.log(`Removing label ${labelId} from mail ${mailId}`);
    console.log('Mail before removing label:', mail.toObject ? mail.toObject() : mail);

    const updated = await Mail.findByIdAndUpdate(
      mailId,
      { $pull: { labels: new Types.ObjectId(labelId) } },
      { new: true }
    ).lean();

    return filterMailForOutput(updated);
  } catch (err) {
    throw err;
  }
}


module.exports = {
  filterMailForOutput,
  canUserAccessMail,
  buildMail,
  getMailsForUser,
  findMailById,
  editMail,
  deleteMail,
  searchMailsForUser,
  addLabelToMail,
  removeLabelFromMail
};
