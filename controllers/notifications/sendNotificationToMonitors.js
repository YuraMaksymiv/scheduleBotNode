const context = require('../../app');
const {User} = require('../../lib/database');

module.exports = async (req, res) => {
    req.log.info(`Start sendNotificationToMonitors controller.`);
    try {
        let {notification, section} = req.body;
        if(!notification || !section) {
            req.log.error(`Some fields are empty`);
            let err = new Error('Some fields are empty');
            err.code = 422;
            throw err;
        }
        notification += "\nНадіслано адміністратором";

        let users = await User.getUsersByFilter({$and: [{section: section}, {userType: "monitor"}]});

        if(!users || !users.length) {
            req.log.error(`Failed to find monitors for current section`);
            let err = new Error('Failed to find monitors for current section');
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
