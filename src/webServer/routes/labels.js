const express = require('express');
const router = express.Router();

const { requireAuth } = require('../middleware/auth');
const { listLabels, createLabel } = require('../controllers/labels');
const { getLabelById, updateLabelById, deleteLabelById } = require('../controllers/labels');

// todo check when label is removed from trash and add it to inbox
router.get('/', requireAuth, listLabels);
router.post('/', requireAuth, createLabel);
router.get('/:id', requireAuth, getLabelById);
router.patch('/:id', requireAuth, updateLabelById);
router.delete('/:id', requireAuth, deleteLabelById);
// todo add ability to empty trash 

module.exports = router;
