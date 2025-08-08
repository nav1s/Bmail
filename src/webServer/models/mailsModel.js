/**
 * @file models/mailsModel.js
 * @description Mongoose schema & model for mails.
 * We support drafts, soft-delete per actor, label references, and URL extraction.
 */

const { Schema, model, Types } = require('mongoose');

/**
 * @typedef MailDoc
 * @property {Types.ObjectId} _id
 * @property {string} from - Sender username.
 * @property {string[]} to - Recipient usernames.
 * @property {string} title
 * @property {string} body
 * @property {boolean} draft
 * @property {Types.ObjectId[]} labels - References to Label docs.
 * @property {string[]} urls - URLs extracted from title/body.
 * @property {boolean} deletedBySender - Soft delete flag for sender.
 * @property {string[]} deletedByRecipient - Recipients who soft-deleted this mail.
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

const MailSchema = new Schema(
  {
    from: { type: String, required: true, index: true },
    to: { type: [String], required: true, index: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    draft: { type: Boolean, default: false },
    labels: [{ type: Types.ObjectId, ref: 'Label', index: true }],
    urls: { type: [String], default: [] },
    deletedBySender: { type: Boolean, default: false },
    deletedByRecipient: { type: [String], default: [] }
  },
  { timestamps: true }
);

// Simple text search for title/body
MailSchema.index({ title: 'text', body: 'text' });

/**
 * @type {import('mongoose').Model<MailDoc>}
 */
module.exports = model('Mail', MailSchema);
