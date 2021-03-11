const context = require('../../app');
const {User} = require('../../lib/database');

module.exports = async (req, res) => {
    req.log.info(`Start sendNotificationToUser controller.`);
    try {
        let notification = req.body.notification;
        const userId = req.params.userId;

        if(!notification) {
            req.log.error(`Some fields are empty`);
            let err = new Error('Some fields are empty');
            err.code = 422;
            throw err;
        }

        let user = await User.getUser(userId);

        if(!user) {
            req.log.error(`Failed to find user`);
            let err = new Error('Failed to find user');
            err.code = 404;
            throw err;
        }

        notification += "\nНадіслано адміністратором";
        await context.bot.sendMessage(user.userId, notification);

        res.json(true);

    } catch (err) {
        console.log(err);
        res.statusCode = err.code
        res.json(err.message);
    }
};
