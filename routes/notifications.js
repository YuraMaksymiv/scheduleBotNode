const router = require('express').Router();
const tokenVerificator = require('../lib/tokenVerificator');

const sendNotificationToGroup = require('../controllers/notifications/sendNotificationToGroup');
const sendNotificationToAll = require('../controllers/notifications/sendNotificationToAll');
const sendNotificationToSection = require('../controllers/notifications/sendNotificationToSection');

router.post('', tokenVerificator, sendNotificationToGroup);
router.post('/all', tokenVerificator, sendNotificationToAll);
router.post('/section', tokenVerificator, sendNotificationToSection);

module.exports = router;
