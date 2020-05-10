const router = require('express').Router();
const multer  = require('multer');
const storage = multer.memoryStorage()
const upload = multer({ storage: storage });
const tokenVerificator = require('../lib/tokenVerificator');

const importSchedule = require('../controllers/import/importSchedule');

router.post('/schedule', tokenVerificator, upload.single('file'), importSchedule);

module.exports = router;
