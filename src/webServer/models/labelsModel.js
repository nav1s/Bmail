const { Schema, model, Types } = require('mongoose');

/** Names of system default labels every user has by default. */
const DEFAULT_LABELS = ['inbox', 'sent', 'drafts', 'spam', 'trash', 'starred'];

/**
 * LabelSchema describes a label that can be attached to mails.
 *
 * Fields:
 * - userId {ObjectId} required, owner of the label
 * - name {String} required, unique per user
 * - isDefault {Boolean} true if system label (not user-created)
 * - isAttachable {Boolean} if it can be manually added to mails
 * - createdAt {Date} timestamp auto-set by mongoose
 * - updatedAt {Date} timestamp auto-set by mongoose
 *
 * Return: Mongoose Label model, plus DEFAULT_LABELS list.
 * Throws: Validation errors on missing fields or duplicate name for a user.
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

// Enforce uniqueness of label names per user
LabelSchema.index({ userId: 1, name: 1 }, { unique: true });

module.exports = {
  Label: model('Label', LabelSchema),
  DEFAULT_LABELS
};
