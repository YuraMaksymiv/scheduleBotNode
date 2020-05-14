const router = require('express').Router();
const tokenVerificator = require('../lib/tokenVerificator');

const getAllGroups = require('../controllers/groups/getAllGroups');
const getGroupsBySection = require('../controllers/groups/getGroupsBySection');
const getMainGroupsBySection = require('../controllers/groups/getMainGroupsBySection');

router.get('/', tokenVerificator, getAllGroups);
router.get('/groupsListBySection/:section', tokenVerificator, getGroupsBySection);
router.get('/mainGroupsBySection/:section', tokenVerificator, getMainGroupsBySection);

module.exports = router;
