const express = require('express');
const router = express.Router();
const users = require('../controllers/users');
const { requireAuth } = require('../middleware/auth');

router.post('/', users.createUser);
router.get('/:id', users.getUserById);
router.patch('/', requireAuth, users.updateUserById);

module.exports = router;
