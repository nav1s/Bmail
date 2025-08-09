// controllers/labels.js
const { Types } = require('mongoose');
const { created, badRequest, ok, noContent } = require('../utils/httpResponses');
const { httpError } = require('../utils/error');

const {
  getLabelsForUser,
  addLabelForUser,
  getLabelForUserById,
  deleteLabelForUser,
  updateLabelForUser,
} = require('../services/labelServices');

function isValidObjectId(id) {
  return Types.ObjectId.isValid(id);
}

/**
 * Lists all labels for the authenticated user.
 * Also ensures that system default labels exist for that user.
 *
 * @param {object} req - Express request object (requires `req.user.id`)
 * @param {object} res - Express response object
 */
async function listLabels(req, res) {
  const userId = req.user.id;
  try {
    const labels = await getLabelsForUser(userId);
    return ok(res, labels);
  } catch (err) {
    return httpError(res, err);
  }
}

/**
 * Creates a new custom label for the authenticated user.
 *
 * @param {object} req - Express request object
 * @param {object} req.body - Request body
 * @param {string} req.body.name - Name of the label (non-empty string)
 * @param {object} res - Express response object
 */
async function createLabel(req, res) {
  const userId = req.user.id;

  if (!req.body || typeof req.body !== 'object') {
    return badRequest(res, 'Request body is required');
  }
  if (Object.keys(req.body).length !== 1 || typeof req.body.name !== 'string') {
    return badRequest(res, 'Body must contain exactly one field: "name"');
  }
  const name = req.body.name.trim();

  try {
    const label = await addLabelForUser(userId, name);
    return created(res, label);
  } catch (err) {
    return httpError(res, err);
  }
}

/**
 * Retrieves a label (owned by the authenticated user) by its ID.
 *
 * @param {object} req - Express request object
 * @param {object} req.params - Route params
 * @param {string} req.params.id - Label identifier (required, non-empty string)
 * @param {object} res - Express response object
 */
async function getLabelById(req, res) {
  const userId = req.user.id;
  const id = req.params.id;

  if (typeof id !== 'string' || id.trim() === '') {
    return badRequest(res, 'Label ID is required');
  }

  try {
    const label = await getLabelForUserById(userId, id);
    return ok(res, label);
  } catch (err) {
    return httpError(res, err);
  }
}


/**
 * Updates the name of a custom label for the authenticated user.
 *
 * Expects:
 * - req.params.id: string (Label ID)
 * - req.body.name: string (non-empty)
 */
async function updateLabelById(req, res) {
  const userId = req.user.id;
  const labelId = req.params.id;

  // Ensure label ID is provided
  if (!labelId) {
    return badRequest(res, 'Label ID is required');
  }

  // Ensure request body has only "name" and it's a non-empty string
  if (!req.body || typeof req.body !== 'object') {
    return badRequest(res, 'Request body is required');
  }
  if (Object.keys(req.body).length !== 1 || typeof req.body.name !== 'string') {
    return badRequest(res, 'Body must contain exactly one field: "name"');
  }
  const name = req.body.name.trim();
  if (name === '') {
    return badRequest(res, 'Label name must be a non-empty string');
  }

  try {
    const updated = await updateLabelForUser(userId, labelId, name);
    return ok(res, updated);
  } catch (err) {
    return httpError(res, err);
  }
}


/**
 * Deletes a custom label owned by the authenticated user.
 *
 * Expects:
 * - req.params.id: string (label identifier, required; service will validate format)
 */
async function deleteLabelById(req, res) {
  const userId = req.user.id;
  const labelId = req.params.id;

  if (typeof labelId !== 'string' || labelId.trim() === '') {
    return badRequest(res, 'Label ID is required');
  }

  try {
    await deleteLabelForUser(userId, labelId); // service validates ObjectId & ownership
    return noContent(res);
  } catch (err) {
    return httpError(res, err);
  }
}

module.exports = { listLabels, createLabel, getLabelById, updateLabelById, deleteLabelById };
