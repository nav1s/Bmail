const userFieldConfig = {
  id: { public: true },
  username: { public: true, required: true },
  firstName: { public: true, required: true },
  lastName: { public: true, required: true },
  password: { public: false, required: true },
  image: { public: true, required: false } // optional future support
};

function getRequiredFields() {
  return Object.entries(userFieldConfig)
    .filter(([_, config]) => config.required)
    .map(([field]) => field);
}

function filterUserByVisibility(user, visibility = 'public') {
  const filtered = {};
  for (const [field, config] of Object.entries(userFieldConfig)) {
    if (visibility === 'public' && config.public && user[field] !== undefined) {
      filtered[field] = user[field];
    }
  }
  return filtered;
}

module.exports = {
  userFieldConfig,
  filterUserByVisibility,
  getRequiredFields
};
