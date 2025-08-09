/**
 * @file models/labelsModel.js
 * @description Mongoose schema & model for user labels.
 * A label belongs to a user and can be "system" (inbox, sent, drafts, spam, trash)
 * or user-defined. We do NOT store mail IDs on labels; mails reference labels.
 */

const { Schema, model, Types } = require('mongoose');

/** System default label names */
const SYSTEM_DEFAULT_LABELS = ['inbox', 'sent', 'drafts', 'spam', 'trash', 'starred'];

/**
 * @typedef LabelDoc
 * @property {Types.ObjectId} _id
 * @property {Types.ObjectId} userId - Owner of the label.
 * @property {string} name - Label name (unique per user).
 * @property {boolean} system - Whether the label is a system default.
 * @property {boolean} attachable - Whether this label can be manually attached to mails.
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

const LabelSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true },
    system: { type: Boolean, default: false },
    attachable: { type: Boolean, default: true }
  },
  { timestamps: true }
);

// Defining unique label names per user
LabelSchema.index({ userId: 1, name: 1 }, { unique: true });

module.exports = {
  Label: model('Label', LabelSchema),
  SYSTEM_DEFAULT_LABELS
};
