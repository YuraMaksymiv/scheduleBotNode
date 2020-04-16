const router = require('express').Router();

const importGroupsList = require('../controllers/import/importGroupsList');
const importSchedule = require('../controllers/import/importSchedule');

router.post('/groupsList', importGroupsList);
router.post('/schedule', importSchedule);

module.exports = router;
