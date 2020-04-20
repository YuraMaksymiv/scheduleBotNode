const router = require('express').Router();
const tokenVerificator = require('../lib/tokenVerificator');

const login = require('../controllers/user/login');
const register = require('../controllers/user/register');
const getUsersForGroup = require('../controllers/user/getUsersForGroup');

router.post('/login', login);
router.post('/register', register);
router.post('/getUsersForGroup', tokenVerificator, getUsersForGroup);

module.exports = router;
