const { Schema, model, Types } = require('mongoose');

/**
 * MailSchema defines the structure for mail documents.
 *
 * Fields:
 * - from {String} required, sender username
 * - to {String[]} required unless draft=true, recipients
 * - title {String} required unless draft=true
 * - body {String} required unless draft=true
 * - draft {Boolean} default false
 * - labels {ObjectId[]} references Label documents
 * - urls {String[]} extracted links in body/title
 * - deletedBySender {Boolean} soft delete flag for sender
 * - deletedByRecipient {String[]} usernames of recipients who deleted
 * - createdAt {Date} auto-set timestamp
 * - updatedAt {Date} auto-set timestamp
 *
 * Return: Mongoose Mail model with full text search index.
 * Throws: Validation errors if required fields are missing in non-draft mails.
 */
const MailSchema = new Schema({
  from: { type: String, required: true, public: true },

  // required only for non-draft mails
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

// expose timestamps as public for API DTOs
MailSchema.path('createdAt').options.public = true;
MailSchema.path('updatedAt').options.public = true;

// Add a text index on title and body for search queries
MailSchema.index({ title: 'text', body: 'text' });

module.exports = model('Mail', MailSchema);
