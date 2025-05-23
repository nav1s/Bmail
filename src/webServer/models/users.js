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

module.exports = { addUser };
