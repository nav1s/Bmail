const express = require('express');
const router = express.Router();

const { createUser, getUserByUsername, getUserById, updateUserById } = require('../controllers/users');
const { requireAuth } = require('../middleware/auth');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// POST /api/users - Create a new user, optionally with an image file
router.post('/', upload.single('image'), createUser);

// GET /api/users/username/:username - Get user by username, also the path of an image file if it exists
router.get('/username/:username', getUserByUsername);

// GET /api/users/:id - Get user by ID
router.get('/:id', getUserById);

// PATCH /api/users - Update user by ID, optionally with an image
router.patch('/', requireAuth, upload.single('image'), updateUserById);

module.exports = router;
