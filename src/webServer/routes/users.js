const express = require('express');
const router = express.Router();
const users = require('../controllers/users');
const { requireAuth } = require('../middleware/auth');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// POST /api/users - Create a new user
router.post('/', upload.single('file'), users.createUser);
// GET /api/users/username/:username - Get user by username
router.get('/username/:username', users.getUserByUsername);
// GET /api/users/:id - Get user by ID
router.get('/:id', users.getUserById);
// PATCH /api/users - Update user by ID
router.patch('/', requireAuth, upload.single('file'), users.updateUserById);

module.exports = router;
