const express = require('express');
const router = express.Router();
const users = require('../controllers/users');
const { requireAuth } = require('../middleware/auth');

// POST /api/users - Create a new user
router.post('/', users.createUser);
// GET /api/users/:id - Get user by ID
router.get('/:id', users.getUserById);
// GET /api/users/username/:username - Get user by username
router.get('/username/:username', users.getUserByUsername);
// PATCH /api/users - Update user by ID
router.patch('/', requireAuth, users.updateUserById);

module.exports = router;
