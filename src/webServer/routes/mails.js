const express = require('express');
const router = express.Router();

const { createMail, listInbox } = require('../controllers/mails');
const { requireAuth } = require('../middleware/auth');

// GET /api/mails → returns last 50 mails sent/received by the user
router.get('/', requireAuth, listInbox);

// POST /api/mails → sends a new mail (must be logged in)
router.post('/', requireAuth, createMail);

module.exports = router;
