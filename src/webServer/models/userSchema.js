const { users } = require('../data/memory');

// Static counter id
let idCounter = 1;

/**
 * Adds a new user to the in-memory store.
 * Accepts all user fields as a single object.
 *
 * @param {object} userData - Object containing user fields
 * @returns {{
 *   success: boolean,
 *   user?: object,
 *   error?: string
 * }}
 */
function addUser(userData) {
    // Checks username duplication
  if (users.find(u => u.username === userData.username)) {
    return { success: false, error: 'Username already exists.' };
  }

  const newUser = {
    id: idCounter++,
    ...userData
  };

  users.push(newUser);
  return { success: true, user: newUser };
}

const userFieldConfig = {
  id: { public: true },
  username: { public: true, required: true },
  firstName: { public: true, required: true },
  lastName: { public: true, required: true },
  password: { public: false, required: true },
  //image: { public: true, required: false } // optional future support
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
  getRequiredFields,
  addUser
};
