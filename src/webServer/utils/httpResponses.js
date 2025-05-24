/**
 * Sends a 200 OK with optional JSON data.
 * @param {import('express').Response} res
 * @param {object} data
 */
function ok(res, data) {
  return res.status(200).json(data);
}

/**
 * Sends a 400 Bad Request with a JSON error message.
 * @param {import('express').Response} res
 * @param {string} message
 */
function badRequest(res, message) {
  return res.status(400).json({ error: message });
}

/**
 * Sends a 401 Unauthorized Request with a JSON error message.
 * @param {import('express').Response} res
 * @param {string} message
 */
function unauthorized(res, message = 'Unauthorized') {
  return res.status(401).json({ error: message });
}


/**
 * Sends a 404 Not Found with a JSON error message.
 * @param {import('express').Response} res
 * @param {string} message
 */
function notFound(res, message) {
  return res.status(404).json({ error: message });
}

/**
 * Sends a 201 Created with a Location header and no body.
 * @param {import('express').Response} res
 * @param {string} locationUrl
 */
function createdWithLocation(res, locationUrl) {
  return res.status(201).location(locationUrl).end();
}

/**
 * Sends a 201 Created with JSON data (used when not following header-only REST).
 * @param {import('express').Response} res
 * @param {object} data
 */
function created(res, data) {
  return res.status(201).json(data);
}

module.exports = {
  badRequest,
  notFound,
  unauthorized,
  created,
  createdWithLocation,
  ok
};
