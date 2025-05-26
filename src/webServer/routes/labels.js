const express = require('express');
var router = express.Router();

module.exports = router;
const express = require('express');
const router = express.Router();

const { requireAuth } = require('../middleware/auth');
const { listLabels, createLabel } = require('../controllers/labels');
const { getLabelById, updateLabelById, deleteLabelById } = require('../controllers/labels');

router.get('/', requireAuth, listLabels);
router.post('/', requireAuth, createLabel);
router.get('/:id', requireAuth, getLabelById);
router.patch('/:id', requireAuth, updateLabelById);
router.delete('/:id', requireAuth, deleteLabelById);

module.exports = router;
