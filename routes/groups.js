const router = require('express').Router();

const getAllGroups = require('../controllers/groups/getAllGroups');
const getGroupsBySection = require('../controllers/groups/getGroupsBySection');

router.get('/', getAllGroups);
router.get('/groupsListBySection/:section', getGroupsBySection);

module.exports = router;
