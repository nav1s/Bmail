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

  // Conditionally required only when not a draft
  to: {
    type: [String],
    public: true,
    required: function () { return this && this.draft === false; }
  },
  title: {
    type: String,
    public: true,
    required: function () { return this && this.draft === false; }
  },
  body: {
    type: String,
    public: true,
    required: function () { return this && this.draft === false; }
  },

  draft: { type: Boolean, default: false, public: true },
  labels: [{ type: Schema.Types.ObjectId, ref: 'Label', public: true }],
  urls: { type: [String], default: [], public: true },
  deletedBySender: { type: Boolean, default: false }, // not public
  deletedByRecipient: { type: [String], default: [] }, // not public
}, { timestamps: true });

// expose timestamps via public DTO logic
MailSchema.path('createdAt').options.public = true;
MailSchema.path('updatedAt').options.public = true;

// text index for search endpoint (/api/mails/search)
MailSchema.index({ title: 'text', body: 'text' });

module.exports = model('Mail', MailSchema);
