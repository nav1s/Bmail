const { createError } = require('../utils/error');

// Static counter id
let idCounter = 1;
const users = [];

// Centralized user field configuration
const userFieldConfig = {
  id: { public: true, required: false, editable: false  },
  username: { public: true, required: true, editable: true },
  firstName: { public: true, required: true, editable: true },
  lastName: { public: true, required: true, editable: true },
  password: { public: false, required: true, editable: true },
  image: { public: true, required: false, editable: true }
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
    ...userData,
    id: idCounter++
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

// /**
//  * @brief Finds a user by their username.
//  * @param {*} username 
//  * @returns {Object} The user object if found.
//  */
// function findUserByUsername(username) {
//   const user = users.find(user => user.username === username);
//   if (!user) {
//     throw createError('User not found', { status: 404, type: 'NOT_FOUND' });
//   }
//   return user;
// }

/**
 * @brief This function updates a user object with the provided updates.
 * @param {*} user The user object to update.
 * @param {*} updates The updates to apply to the user object.
 */
function updateUserById(user, updates) {
  const editableFields = Object.entries(userFieldConfig)
    .filter(([_, config]) => config.editable)
    .map(([field]) => field);
  
  // check if the updates contain uneditable fields
  const uneditableFields = Object.keys(updates).filter(field => !editableFields.includes(field));
  if (uneditableFields.length > 0) {
    throw createError(`Fields ${uneditableFields.join(', ')} are not editable`, { status: 400 });
  }

  for (const field of editableFields) {
    if (field in updates) {
      if (typeof updates[field] !== 'string') {
        throw createError(`Field "${field}" must be a string`, { status: 400 });
      }

      // check if the field is the username and if it already exists
      if (field === 'username' && users.some(u => u.username === updates[field] && u.id !== user.id)) {
        throw createError('Username already exists', { status: 400, type: 'DUPLICATE' });
      }
      console.log(`Updating field "${field}" for user ${user.username}`);
      user[field] = updates[field];
    }
  }

  // update the user in the array
  const index = users.findIndex(u => u.id === user.id);
  if (index === -1) {
    throw createError('User not found', { status: 404 });
  }
  users[index] = user;
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
  updateUserById,
  findUserByUsername,
  login
};
