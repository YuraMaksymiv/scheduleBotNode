const context = require('../../app');
const {User} = require('../../lib/database');

module.exports = async (req, res) => {
    req.log.info(`Start sendNotificationToGroup controller.`);
    try {
        let {notification, group} = req.body;
        if(!notification || !group) {
            req.log.error(`Some fields are empty`);
            let err = new Error('Some fields are empty');
            err.code = 422;
            throw err;
        }
        notification += "\nНадіслано адміністратором";

        let users = await User.getUsersForGroup(group);

        if(!users || !users.length) {
            req.log.error(`Failed to find users for current group`);
            let err = new Error('Failed to find users for current group');
            err.code = 404;
            throw err;
        }

        for (let i = 0; i < users.length; i++) {
            await context.bot.sendMessage(users[i].userId, notification);
        }

        res.json(true);

    } catch (err) {
        console.log(err);
        res.statusCode = err.code
        res.json(err.message);
    }
};
