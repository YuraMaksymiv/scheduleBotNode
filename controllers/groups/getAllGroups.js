const {Group} = require('../../lib/database');

module.exports = async (req, res) => {
    req.log.info(`Start getAllGroups controller.`);
    try {
        let groups = await Group.getGroups();

        res.json(groups);

    } catch (err) {
        console.log(err);
        res.statusCode = err.code
        res.json(err.message);
    }
};
