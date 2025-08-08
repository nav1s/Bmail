/**
 * @file models/labelsModel.js
 * @description Mongoose schema & model for user labels.
 * A label belongs to a user and can be "system" (inbox, sent, drafts, spam, trash)
 * or user-defined. We do NOT store mail IDs on labels; mails reference labels.
 */

const { Schema, model, Types } = require('mongoose');

/**
 * @typedef LabelDoc
 * @property {Types.ObjectId} _id
 * @property {Types.ObjectId} userId - Owner of the label.
 * @property {string} name - Label name (unique per user).
 * @property {boolean} system - Whether the label is a system default.
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

const LabelSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true },
    system: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// Defining unique label names per user
LabelSchema.index({ userId: 1, name: 1 }, { unique: true });

module.exports = model('Label', LabelSchema);
