const { Schema, model, Types } = require('mongoose');

/** System default label names */
const DEFAULT_LABELS = ['inbox', 'sent', 'drafts', 'spam', 'trash', 'starred'];

/**
 * @typedef LabelDoc
 * @property {Types.ObjectId} _id
 * @property {Types.ObjectId} userId - Owner of the label.
 * @property {string} name - Label name (unique per user).
 * @property {boolean} isDefault - Whether the label is a system/default label.
 * @property {boolean} isAttachable - Whether this label can be manually attached to mails.
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

const LabelSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
    isAttachable: { type: Boolean, default: true }
  },
  { timestamps: true }
);

// Defining unique label names per user
LabelSchema.index({ userId: 1, name: 1 }, { unique: true });

module.exports = {
  Label: model('Label', LabelSchema),
  DEFAULT_LABELS
};
