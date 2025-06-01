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
 */
function created(res, data) {
  return res.status(201).json(data);
}

/**
 * Sends a 204 No Content with no response body.
 * Typically used for successful DELETE operations.
 *
 * @param {import('express').Response} res
 */
function noContent(res) {
  return res.status(204).end();
}

/**
 * sends a 500 Internal Server Error with a JSON error message.
 * @param res the response object
 * @param message  the error message to send
 */
function serverError(res, message = 'Internal Server Error') {
  return res.status(500).json({ error: message }).end();
}

module.exports = {
  ok,
  badRequest,
  unauthorized,
  notFound,
  created,
  createdWithLocation,
  noContent,
  serverError
};
