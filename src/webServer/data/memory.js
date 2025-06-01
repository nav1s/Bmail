/**
 * In-memory data stores for users and tokens.
 * These reset every time the server restarts.
 */

const mails = []; // [{ id, from, to[], title, body, timestamp }]

const userLabels = {}; // key = userId, value = array of labels [{ id, name }]


module.exports = {
  mails,
  labels: userLabels
};


