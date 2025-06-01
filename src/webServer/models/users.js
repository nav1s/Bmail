const { createError } = require('../utils/error');

// Static counter id
let idCounter = 1;
const users = [];

// Centralized user field configuration
const userFieldConfig = {
  id: { public: true },
  username: { public: true, required: true },
  firstName: { public: true, required: true },
  lastName: { public: true, required: true },
  password: { public: false, required: true },
  //image: { public: true, required: false } // optional future support
};

/**
 * Authenticates a user by username and password.
 * @param {string} username
 * @param {string} password
 * @returns {Object} The authenticated user.
 * @throws {Error} If credentials are invalid.
 */
function login(username, password) {
  // Searching for user with matching username and password
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) {
    throw createError('Invalid username or password', { status: 401, type: 'AUTH' });
  }
  return user;
}

/**
 * @brief Creates a new user with the provided data.
 * @param userData Object containing username, firstName, lastName, password.
 */
function createUser(userData) {
    // Checks username duplication
    if (users.find(u => u.username === userData.username)) {
      throw createError('Username already exists', { status: 400, type: 'DUPLICATE' });
    }

  // add id to the user data
  const newUser = {
    id: idCounter++,
    ...userData
  };

  // add the new user to the users array
  users.push(newUser);
  return newUser;
}

/**
 * Finds a user by their ID.
 * @param {number} id - The ID of the user to find.
 * @returns {Object} The user object.
 * @throws {Error} If no user is found with the given ID.
 */
function findUserById(id) {
  const user = users.find(user => user.id === id);
  if (!user) {
    throw createError('User not found', { status: 404, type: 'NOT_FOUND' });
  }
  return user;
}


/**
 * Finds a user by username.
 *
 * @param {string} username - The username to search for.
 * @returns {object} The user object if found.
 * @throws {Error} If no user is found.
 */
function findUserByUsername(username) {
  const user = users.find(u => u.username === username);
  if (!user) {
    throw createError('User not found', { status: 404 });
  }
  return user;
}


/**
 * @brief Returns an array of required user fields based on the centralized field config.
 */
function getRequiredFields() {
  return Object.entries(userFieldConfig)
    .filter(([_, config]) => config.required)
    .map(([field]) => field);
}

/**
 * brief Filters user data based on visibility settings.
 * @param user the user object to filter
 * @param visibility the visibility level ('public' or 'private')
 * @returns the user object with only the fields that are public.
 */
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
  findUserByUsername,
  login
};
