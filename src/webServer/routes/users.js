const express = require('express');
const router = express.Router();
const users = require('../controllers/users');

router.post('/', users.createUser);
router.get('/:id', users.getUserById);
router.patch('/:id', users.updateUserById);

module.exports = router;
