const {User} = require('../../lib/database');

module.exports = async (req, res) => {
    req.log.info(`Start getUsersForGroup controller.`);
    try {
        let users = await User.getUsersForGroup(req.body.group);
        res.json(users);

    } catch (e) {
        console.log(e);
        res.statusCode = e.code;
        res.json(e.message);
    }
};
