const express = require('express');
const router = express.Router();
const { register } = require('../controllers/users');

router.post('/', register);

module.exports = router;
