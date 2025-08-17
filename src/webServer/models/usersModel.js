const { Schema, model } = require('mongoose');

/**
 * Configuration metadata for user fields.
 * Defines visibility, requiredness, and whether each field can be edited.
 */
const userFieldConfig = {
  username: { public: true, required: true, editable: false },
  firstName: { public: true, required: true, editable: true },
  lastName: { public: true, required: true, editable: true },
  password: { public: false, required: true, editable: true },
  image: { public: true, required: false, editable: true }
};

/**
 * UserSchema defines how a user document is stored in MongoDB.
 *
 * Fields:
 * - username {String} required, unique index
 * - firstName {String} required
 * - lastName {String} required
 * - password {String} required
 * - image {String} optional (path to profile image)
 *
 * Return: Mongoose User model with timestamps and helpers.
 * Throws: Standard mongoose validation errors if required fields are missing.
 */
const UserSchema = new Schema(
  {
    username: { type: String, required: true, index: true },
    firstName: { type: String, required: true },
    lastName:  { type: String, required: true },
    password:  { type: String, required: true },
    image:     { type: String },
  },
  { timestamps: true }
);

// Attach config for use in services/controllers
UserSchema.statics.fieldConfig = userFieldConfig;

// Create a virtual `id` that mirrors the default `_id`
UserSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

// Ensure virtual fields are included when converting to JSON/object
UserSchema.set('toJSON', { virtuals: true });
UserSchema.set('toObject', { virtuals: true });

module.exports = model('User', UserSchema);
