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
 * @brief Creates a new user with the provided data as a json.
 * @param {Object} userData - An object containing required user fields: username, firstName, lastName, password.
 * @throws {Error} If a user with the given username already exists.
 * @returns {Object} The newly created user object.
 */
function login(username, password) {
  return users.find(u => u.username === username && u.password === password);
}
/**
 * @brief Creates a new user with the provided data.
 * @param userData Object containing username, firstName, lastName, password.
 */
function createUser(userData) {
    // Checks username duplication
    if (users.find(u => u.username === userData.username)) {
    throw new Error('Username already exists');
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
    throw new Error('User not found');
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
  login,
};
