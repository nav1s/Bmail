const { labels } = require('../data/memory');
const { buildLabel } = require('../models/labelSchema');
const { badRequest, created, ok } = require('../utils/httpResponses');

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

module.exports = { listLabels, createLabel };
