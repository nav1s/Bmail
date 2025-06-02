/**
 * Sends a 200 OK with optional JSON data.
 * @param {import('express').Response} res
 * @param {object} data
 */
exports.ok = (res, data) =>
  res.status(200).json(data)

/**
 * Sends a 201 Created with JSON data (used when not following header-only REST).
 * @param {import('express').Response} res
 * @param {object} data
 */
exports.created = (res, data) =>
  res.status(201).json(data)

/**
 * Sends a 201 Created with a Location header and no body.
 * @param {import('express').Response} res
 * @param {string} locationUrl
 */
exports.createdWithLocation = (res, locationUrl) =>
  res.status(201).location(locationUrl).end();

/**
 * Sends a 204 No Content with no response body.
 * Typically used for successful DELETE operations.
 * @param {import('express').Response} res
 */
exports.noContent = (res) =>
  res.status(204).end();

/**
 * Sends a 400 Bad Request with a JSON error message.
 * @param {import('express').Response} res
 * @param {string} message
 */
exports.badRequest = (res, message = 'Bad request') =>
  res.status(400).json({ error: message });

/**
 * Sends a 401 Unauthorized with a JSON error message.
 * @param {import('express').Response} res
 * @param {string} message
 */
exports.unauthorized = (res, message = 'Unauthorized') =>
  res.status(401).json({ error: message });

/**
 * Sends a 403 Forbidden with a JSON error message.
 * @param {import('express').Response} res
 * @param {string} message
 */
exports.forbidden = (res, message = 'Forbidden') =>
  res.status(403).json({ error: message });

/**
 * Sends a 404 Not Found with a JSON error message.
 * @param {import('express').Response} res
 * @param {string} message
 */
exports.notFound = (res, message = 'Not found') =>
  res.status(404).json({ error: message });


/**
 * sends a 500 Internal Server Error with a JSON error message.
 * @param res the response object
 * @param message  the error message to send
 */
exports.serverError = (res, message = 'Internal Server Error') => {
  return res.status(500).json({ error: message });
};
