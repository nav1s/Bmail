const { Schema, model } = require('mongoose');

const userFieldConfig = {
  username: { public: true, required: true, editable: false },
  firstName: { public: true, required: true, editable: true },
  lastName: { public: true, required: true, editable: true },
  password: { public: false, required: true, editable: true },
  image: { public: true, required: false, editable: true }
};

const UserSchema = new Schema(
  {
    username: { type: String, required: true, index: true },
    firstName: { type: String, required: true },
    lastName:  { type: String, required: true },
    password:  { type: String, required: true },
    image:     { type: String }, // <-- store image URL/path
  },
  { timestamps: true }
);

// Attach config to schema for later usage
UserSchema.statics.fieldConfig = userFieldConfig;

module.exports = model('User', UserSchema);
