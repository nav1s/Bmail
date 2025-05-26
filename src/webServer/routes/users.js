const express = require('express');
var router = express.Router();

module.exports = router;
const express = require('express');
const router = express.Router();
const { register, getUserById } = require('../controllers/users');

router.post('/', register);
router.get('/:id', getUserById);

module.exports = router;
