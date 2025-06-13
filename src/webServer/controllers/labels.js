const { getAllLabelsForUser, addLabelForUser, getLabelByUserAndId, deleteLabelForUser, updateLabelForUser } = require('../models/labels');
const { created, badRequest, ok, noContent } = require('../utils/httpResponses');
const { httpError } = require('../utils/error');


/**
 * GET /api/labels
 * Returns all labels for the currently logged-in user.
 *
 * @param {import('express').Request} req - Express request object. Assumes req.user is set.
 * @param {import('express').Response} res - Express response object.
 */
function listLabels(req, res) {
  const userId = req.user.id;

  try {
    const userLabelList = getAllLabelsForUser(userId);
    return ok(res, userLabelList);
  } catch (err) {
    return httpError(res, err);
  }
}

/**
 * POST /api/labels
 * Creates a new label for the logged-in user.
 *
 * @param {import('express').Request} req - Express request object, expects `req.user.id` and JSON body.
 * @param {import('express').Response} res - Express response object.
 * @returns {Object} HTTP Response:
 *   - 201 Created with the new label if successful.
 *   - 400 Bad Request if input is invalid or label already exists.
 */
function createLabel(req, res) {
  const userId = req.user.id;

  if ('body' in req === false || req.body === undefined) {
    return badRequest(res, 'Request body is required');
  }

  const keys = Object.keys(req.body);

  // Validating that we get exactly one label and extracting it.
  if (keys.length !== 1) {
    return badRequest(res, 'Request body must contain exactly one field');
  }
  const name = req.body.name;
  if (!name || typeof name !== 'string') {
    return badRequest(res, 'Label name must be a non-empty string');
  }

  // Adding label to user
  try {
    const label = addLabelForUser(userId, name);
    return created(res, label);
  } catch (err) {
    return httpError(res, err);
  }
}

/**
 * GET /api/labels/:id
 * Returns a specific label by ID for the logged-in user.
 *
 * @param {import('express').Request} req - Express request, expects :id param and req.user
 * @param {import('express').Response} res - Express response
 */
function getLabelById(req, res) {
  const userId = req.user.id;
  // Checking we got a Label id
  const rawId = req.params.id;
  if (rawId === undefined) {
    return badRequest(res, 'Label ID is required');
  }

  // Checking its a number
  const labelId = Number(rawId);
  if (!Number.isInteger(labelId)) {
    return badRequest(res, 'Label ID must be a valid integer');
  }

  // Getting the label
  try {
    const label = getLabelByUserAndId(userId, labelId);
    return ok(res, label);
  } catch (err) {
    return httpError(res, err);
  }
}

/**
 * PATCH /api/labels/:id
 * Updates the name of a label (if it belongs to the current user).
 * Enforces uniqueness of label names per user.
 *
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 */
function updateLabelById(req, res) {
  if ('body' in req === false || req.body === undefined) {
    return badRequest(res, 'Request body is required');
  }

  const userId = req.user.id;

  // Validate fields
  const rawId = req.params?.id;
  if (!rawId) return badRequest(res, 'Label ID parameter is missing');
  const labelId = Number(rawId);
  if (!Number.isInteger(labelId)) {
    return badRequest(res, 'Label ID must be a valid integer');
  }
  const newName = req.body.name;
  if (newName === undefined) {
    return badRequest(res, 'Missing "name" field in request body');
  }


  try {
    const updatedLabel = updateLabelForUser(userId, labelId, newName);
    return ok(res, updatedLabel);
  } catch (err) {
    return httpError(res, err);
  }
}

/**
 * DELETE /api/labels/:id
 * Deletes a label owned by the logged-in user.
 *
 * @param {import('express').Request} req - Express request with :id param
 * @param {import('express').Response} res - Express response
 */
function deleteLabelById(req, res) {
  const userId = req.user.id;

  // Validates fields
  const rawId = req.params?.id;
  if (!rawId) return badRequest(res, 'Label ID parameter is missing');
  const labelId = Number(rawId);
  if (!Number.isInteger(labelId)) {
    return badRequest(res, 'Label ID must be a valid integer');
  }

  // Deleting label
  try {
    deleteLabelForUser(userId, labelId);
    return noContent(res);
  } catch (err) {
    return httpError(res, err);
  }
}

function getMailsByLabelId(req, res) {
  // This function is not implemented in the original code snippet.
  // You can implement it based on your application's requirements.
  return badRequest(res, 'This endpoint is not implemented yet');
}

module.exports = { listLabels, createLabel, getLabelById, updateLabelById, deleteLabelById, getMailsByLabelId };
