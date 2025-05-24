const express = require('express');
const router = express.Router();

const { requireAuth } = require('../middleware/auth');
const { listLabels, createLabel } = require('../controllers/labels');

router.get('/', requireAuth, listLabels);
router.post('/', requireAuth, createLabel);

module.exports = router;
