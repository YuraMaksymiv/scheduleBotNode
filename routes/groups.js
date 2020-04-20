const router = require('express').Router();
const tokenVerificator = require('../lib/tokenVerificator');

const getAllGroups = require('../controllers/groups/getAllGroups');
const getGroupsBySection = require('../controllers/groups/getGroupsBySection');

router.get('/', tokenVerificator, getAllGroups);
router.get('/groupsListBySection/:section', tokenVerificator, getGroupsBySection);

module.exports = router;
