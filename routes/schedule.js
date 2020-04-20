const router = require('express').Router();
const tokenVerificator = require('../lib/tokenVerificator');

const getSchedule = require('../controllers/schedule/getSchedule');
const updateSchedule = require('../controllers/schedule/updateSchedule');

router.get('', tokenVerificator, getSchedule);
router.post('', tokenVerificator, updateSchedule);

module.exports = router;
