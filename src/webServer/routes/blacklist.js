const express = require('express');
const router = express.Router();
const blacklistController = require('../controllers/blacklist');
const { requireAuth } = require('../middleware/auth');

router.post('/', requireAuth, blacklistController.addToBlacklist);
router.delete('/:id', requireAuth, blacklistController.removeFromBlacklist);

module.exports = router;
