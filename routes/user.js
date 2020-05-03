const router = require('express').Router();
const tokenVerificator = require('../lib/tokenVerificator');

const login = require('../controllers/user/login');
const register = require('../controllers/user/register');
const getUsersForGroup = require('../controllers/user/getUsersForGroup');
const changeType = require('../controllers/user/changeType')

router.post('/login', login);
router.post('/register', register);
router.post('/getUsersForGroup', tokenVerificator, getUsersForGroup);
router.post('/type/:userId/:type', tokenVerificator, changeType)

module.exports = router;
