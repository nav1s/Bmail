const { badRequest, notFound, unauthorized, forbidden } = require('../utils/httpResponses');

/**
 * Creates a standard error object with optional status code and type.
 *
 * @param {string} message - The error message.
 * @param {object} options - Optional fields: status (number), type (string)
 * @returns {Error} A customized error object.
 */
exports.createError = (message, { status = 400, type = 'GENERIC' } = {}) => {
  const err = new Error(message);
  err.status = status;
  err.type = type;
  return err;
};

/**
 * Handles known HTTP errors using err.status.
 * Supports 400 and 404 errors, falls back to generic 400.
 *
 * @param {import('express').Response} res - The Express response object
 * @param {Error} err - The error thrown
 * @returns {object} Express response
 */
exports.httpError = (res, err) => {
  const status = Number(err.status);
  return (status === 404 && notFound(res, err.message)) ||
         (status === 400 && badRequest(res, err.message)) ||
         (status === 403 && forbidden(res, err.message)) ||
         (status === 401 && unauthorized(res, err.message)) ||
         badRequest(res, 'Unexpected error');
};
