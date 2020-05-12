const router = require('express').Router();
const tokenVerificator = require('../lib/tokenVerificator');

const sendNotificationToGroup = require('../controllers/notifications/sendNotificationToGroup');
const sendNotificationToAll = require('../controllers/notifications/sendNotificationToAll');
const sendNotificationToSection = require('../controllers/notifications/sendNotificationToSection');
const sendNotificationToUser = require('../controllers/notifications/sendNotificationToUser');
const sendNotificationToMonitors = require('../controllers/notifications/sendNotificationToMonitors');

router.post('', tokenVerificator, sendNotificationToGroup);
router.post(':userId', tokenVerificator, sendNotificationToUser);
router.post('/all', tokenVerificator, sendNotificationToAll);
router.post('/section', tokenVerificator, sendNotificationToSection);
router.post('/monitors', tokenVerificator, sendNotificationToMonitors);

module.exports = router;
