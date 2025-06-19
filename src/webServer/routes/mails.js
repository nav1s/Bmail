const express = require('express');
const router = express.Router();

const { createMail, listInbox } = require('../controllers/mails');
const { requireAuth } = require('../middleware/auth');
const { getMailById, updateMailById, deleteMailById } = require('../controllers/mails');
const { searchMails, attachLabelToMail, detachLabelFromMail, listMailsByLabel } = require('../controllers/mails');

// GET /api/mails → returns last 50 mails sent/received by the user
router.get('/', requireAuth, listInbox);
// GET /api/mails/byLabel/:label → returns last 50 mails filtered by label
router.get('/byLabel/:label', requireAuth, listMailsByLabel);

// POST /api/mails → sends a new mail (must be logged in)
router.post('/', requireAuth, createMail);

// Post /api/mails/:mailId/labels → attaches a label to a mail
router.post('/:mailId/labels', requireAuth, attachLabelToMail);
// delete /api/mails/:id/labels/:labelId → removes a label from a mail
router.delete('/:mailId/labels/:labelId', requireAuth, detachLabelFromMail);

// Important: Put /search/:query BEFORE /:id to prevent conflicts
router.get('/search/:query', requireAuth, searchMails);

router.get('/:id', requireAuth, getMailById);
router.patch('/:id', requireAuth, updateMailById);

// todo fix route
router.delete('/:id', requireAuth, deleteMailById);

module.exports = router;
