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
  ensureDefaultLabels,
} = require('../services/labelServices');

function isValidObjectId(id) {
  return Types.ObjectId.isValid(id);
}

/**
 * GET /api/labels
 * Expects: none
 */
async function listLabels(req, res) {
  const userId = req.user.id;
  try {
    await ensureDefaultLabels(userId);
    const labels = await getLabelsForUser(userId);
    return ok(res, labels);
  } catch (err) {
    return httpError(res, err);
  }
}

/**
 * POST /api/labels
 * Expects: body { name: string }
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
  if (name === '') {
    return badRequest(res, 'Label name must be a non-empty string');
  }

  try {
    const label = await addLabelForUser(userId, name);
    return created(res, label);
  } catch (err) {
    return httpError(res, err);
  }
}

/**
 * GET /api/labels/:id
 * Expects: param id (string)
 */
async function getLabelById(req, res) {
  const userId = req.user.id;
  const id = req.params.id;

  if (!isValidObjectId(id)) {
    return badRequest(res, 'Label ID is invalid');
  }

  try {
    const label = await getLabelForUserById(userId, id);
    return ok(res, label);
  } catch (err) {
    return httpError(res, err);
  }
}

/**
 * PATCH /api/labels/:id
 * Expects: param id (string), body { name: string }
 */
async function updateLabelById(req, res) {
  const userId = req.user.id;
  const id = req.params.id;

  if (!isValidObjectId(id)) {
    return badRequest(res, 'Label ID is invalid');
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
    const updated = await updateLabelForUser(userId, id, name);
    return ok(res, updated);
  } catch (err) {
    return httpError(res, err);
  }
}

/**
 * DELETE /api/labels/:id
 * Expects: param id (string)
 */
async function deleteLabelById(req, res) {
  const userId = req.user.id;
  const id = req.params.id;

  if (!isValidObjectId(id)) {
    return badRequest(res, 'Label ID is invalid');
  }

  try {
    await deleteLabelForUser(userId, id);
    return noContent(res);
  } catch (err) {
    return httpError(res, err);
  }
}

module.exports = { listLabels, createLabel, getLabelById, updateLabelById, deleteLabelById };
