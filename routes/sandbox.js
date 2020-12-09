const router = require('express').Router();
const tokenVerificator = require('../lib/tokenVerificator');
const context = require('../app');

const getAllGroups = require('../controllers/groups/getAllGroups');

router.get('/', tokenVerificator, getAllGroups);
router.get('/me', async (req, res) => {
    try {
        console.log('here');


        res.json(true);

    } catch (err) {
        console.log(err);
        res.statusCode = err.code
        res.json(err.message);
    }
});


module.exports = router;
