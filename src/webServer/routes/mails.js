const express = require('express');
const router = express.Router();

const { createMail, listInbox } = require('../controllers/mails');
const { requireAuth } = require('../middleware/auth');
const { getMailById, updateMailById, deleteMailById } = require('../controllers/mails');
const { searchMails } = require('../controllers/mails');

// GET /api/mails → returns last 50 mails sent/received by the user
router.get('/', requireAuth, listInbox);

// POST /api/mails → sends a new mail (must be logged in)
router.post('/', requireAuth, createMail);

// Important: Put /search/:query BEFORE /:id to prevent conflicts
router.get('/search/:query', requireAuth, searchMails);

router.get('/:id', requireAuth, getMailById);
router.patch('/:id', requireAuth, updateMailById);
router.delete('/:id', requireAuth, deleteMailById);

module.exports = router;
