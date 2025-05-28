const { labels } = require('../data/memory');
const { buildLabel } = require('../models/labelSchema');
const { badRequest, created, ok, notFound, noContent } = require('../utils/httpResponses');

/**
 * GET /api/labels
 * Returns all labels for the currently logged-in user.
 *
 * @param {import('express').Request} req - Express request object. Assumes req.user is set.
 * @param {import('express').Response} res - Express response object.
 */
function listLabels(req, res) {
  const userId = req.user.id;
  // Fetch labels of users, or an empty array if user doesnt have labels yet
  const userLabelList = labels[userId] || [];
  return ok(res, userLabelList);
}

/**
 * POST /api/labels
 * Creates a new label for the logged-in user.
 *
 * @param {import('express').Request} req - Express request object with body: { name: string }
 * @param {import('express').Response} res - Express response object
 */
function createLabel(req, res) {
  const userId = req.user.id;
  // Init labels array for user
  if (!labels[userId]) {
    labels[userId] = [];
  }

  // Builds label
  const id = labels[userId].length + 1;
  const result = buildLabel(req.body, id);
  if (!result.success) {
    return badRequest(res, result.error);
  }

  if (labels[userId].some(l => l.name === result.label.name)) {
    return badRequest(res, 'Label with this name already exists');
  }

  // Adds label
  labels[userId].push(result.label);
  return created(res, result.label);
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
  const labelId = parseInt(req.params.id, 10);
  // Gets user labels or an empty arr if he doesnt have any
  const label = (labels[userId] || []).find(l => l.id === labelId);

  if (!label) return notFound(res, 'Label not found');
  return ok(res, label);
}


/**
 * PATCH /api/labels/:id
 * Updates the name of a label (if it belongs to the current user).
 * Enforces uniqueness of names per user.
 *
 * @param {import('express').Request} req - Express request with body: { name: string }
 * @param {import('express').Response} res - Express response
 */
function updateLabelById(req, res) {
  const userId = req.user.id;
  const labelId = parseInt(req.params.id, 10);
  // Gets user labels or an empty arr if he doesnt have any
  
  const labelList = labels[userId] || [];
  const label = labelList.find(l => l.id === labelId);
  // If label doesnt exist, return not found
  if (!label) return notFound(res, 'Label not found');

  const newName = req.body.name;
  const duplicate = labelList.find(l => l.name === newName && l.id !== labelId);
  // If a label with the new name already exists, return bad request
  if (duplicate) {
    return badRequest(res, 'Label with this name already exists');
  }

  // Updates new label
  
  label.name = newName;
  return ok(res, label);
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
  const labelId = parseInt(req.params.id, 10);
  // Gets user labels or an empty arr if he doesnt have any
  const labelList = labels[userId] || [];
  const index = labelList.findIndex(l => l.id === labelId);


  if (index === -1) return notFound(res, 'Label not found');

  labelList.splice(index, 1);
  return noContent(res);
}


module.exports = { listLabels, createLabel, getLabelById, updateLabelById, deleteLabelById };
