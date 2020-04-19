const router = require('express').Router();
const multer  = require('multer');
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

const importGroupsList = require('../controllers/import/importGroupsList');
const importSchedule = require('../controllers/import/importSchedule');

router.post('/groupsList',upload.single('file'), importGroupsList);
router.post('/schedule', upload.single('file'), importSchedule);

module.exports = router;
