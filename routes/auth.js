const express = require('express');

const { register, login, getMe } = require('../controllers/authController');
const Protect = require('../middlewares/Protect');

const router = express.Router();

router.post('/register', register);

router.post('/login', login);

router.get('/getMe', Protect, getMe);

module.exports = router;
