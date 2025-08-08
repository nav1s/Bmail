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
const MailSchema = new Schema({
  from: { type: String, required: true, public: true },
  to: { type: [String], required: true, public: true },
  title: { type: String, required: true, public: true },
  body: { type: String, required: true, public: true },
  draft: { type: Boolean, default: false, public: true },
  labels: [{ type: Schema.Types.ObjectId, ref: 'Label', public: true }],
  urls: { type: [String], public: true },
  deletedBySender: { type: Boolean, default: false }, // not public
  deletedByRecipient: { type: [String], default: [] }, // not public
}, { timestamps: true });

MailSchema.path('createdAt').options.public = true;
MailSchema.path('updatedAt').options.public = true;

module.exports = mongoose.model('Mail', MailSchema);


/**
 * @type {import('mongoose').Model<MailDoc>}
 */
module.exports = model('Mail', MailSchema);
