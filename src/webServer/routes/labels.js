const express = require('express');
const router = express.Router();

const { requireAuth } = require('../middleware/auth');
const { listLabels, createLabel } = require('../controllers/labels');
const { getLabelById, updateLabelById, deleteLabelById } = require('../controllers/labels');

// GET /api/labels → returns all labels for the user
router.get('/', requireAuth, listLabels);
// POST /api/labels → creates a new label (must be logged in)
router.post('/', requireAuth, createLabel);
// GET /api/labels/:id → returns a label by ID
router.get('/:id', requireAuth, getLabelById);
// PATCH /api/labels/:id → updates a label by ID (must be logged in)
router.patch('/:id', requireAuth, updateLabelById);
// DELETE /api/labels/:id → deletes a label by ID (must be logged in)
router.delete('/:id', requireAuth, deleteLabelById);

module.exports = router;
