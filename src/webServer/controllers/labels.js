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
 * List all labels that belong to the current user.
 * Useful for populating label selectors in the UI.
 *
 * @param {import('express').Request} req - Requires `req.user.id`.
 * @param {import('express').Response} res - Sends 200 with labels array.
 * @returns {Promise<void>} Sends the HTTP response.
 * @throws Sends 500 via httpError if the service call fails.
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
 * Create a new custom label for the current user.
 * Body must contain exactly one field: "name".
 *
 * @param {import('express').Request} req - Body `{ name: string }`.
 * @param {import('express').Response} res - Sends 201 with created label.
 * @returns {Promise<void>} Sends the HTTP response.
 * @throws Sends 400 for invalid body; 500 via httpError on service errors.
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
 * Get a single label by id for the current user.
 * Accepts a string id (ObjectId or other supported form).
 *
 * @param {import('express').Request} req - `params.id` is the label id.
 * @param {import('express').Response} res - Sends 200 with the label object.
 * @returns {Promise<void>} Sends the HTTP response.
 * @throws Sends 400 for missing/empty id; 500 via httpError on failures.
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
 * Update a label’s name for the current user.
 * Only the "name" field is allowed.
 *
 * @param {import('express').Request} req - `params.id` and body `{ name: string }`.
 * @param {import('express').Response} res - Sends 200 with the updated label.
 * @returns {Promise<void>} Sends the HTTP response.
 * @throws Sends 400 for invalid input; 500 via httpError on service errors.
 */
async function updateLabelById(req, res) {
  const userId = req.user.id;
  const labelId = req.params.id;

  if (!labelId) {
    return badRequest(res, 'Label ID is required');
  }

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
 * Delete a label owned by the current user.
 * If successful, the response has no body.
 *
 * @param {import('express').Request} req - `params.id` is the label id.
 * @param {import('express').Response} res - Sends 204 on success.
 * @returns {Promise<void>} Sends the HTTP response.
 * @throws Sends 400 for invalid id; 500 via httpError on service errors.
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
