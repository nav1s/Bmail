// Static counter id
let idCounter = 1;
const users = [];

/**
 * @brief allow user login by username and password.
 * @param username the username of the user
 * @param password the password of the user
 * @returns user object if login is successful, otherwise undefined.
 */
function login(username, password) {
  return users.find(u => u.username === username && u.password === password);
}
/**
 * Adds a new user to the in-memory store.
 * Accepts all user fields as a single object.
 */
function createUser(userData) {
    // Checks username duplication
  if (users.find(u => u.username === userData.username)) {
    return { success: false, error: 'Username already exists.' };
  }

  const newUser = {
    id: idCounter++,
    ...userData
  };

  users.push(newUser);
  return {success: true, newUser};
}

function findUserById(id) {
  return users.find(user => user.id === id);
}

const userFieldConfig = {
  id: { public: true },
  username: { public: true, required: true },
  firstName: { public: true, required: true },
  lastName: { public: true, required: true },
  password: { public: false, required: true },
  //image: { public: true, required: false } // optional future support
};

/**
 * @brief Returns an array of required user fields based on the centralized field config.
 */
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
  filterUserByVisibility,
  getRequiredFields,
  createUser,
  findUserById,
  login
};
