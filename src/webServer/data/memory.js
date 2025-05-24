/**
 * In-memory data stores for users and tokens.
 * These reset every time the server restarts.
 */

const users = []; // [{ id, username, password }]

const mails = []; // [{ id, from, to[], title, body, timestamp }]

const userLabels = {}; // key = userId, value = array of labels [{ id, name }]


module.exports = {
  users,
  mails,
  labels: userLabels
};


