const router = require('express').Router();

const getSchedule = require('../controllers/schedule/getSchedule');
const updateSchedule = require('../controllers/schedule/updateSchedule');

router.get('/', getSchedule);
router.post('/', updateSchedule);

module.exports = router;
