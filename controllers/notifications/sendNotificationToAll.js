const context = require('../../app');

module.exports = async (req, res) => {
    req.log.info(`Start sendNotificationToAll controller.`);
    try {
        let {notification} = req.body;
        if(!notification) {
            req.log.error(`Some fields are empty`);
            let err = new Error('Some fields are empty');
            err.code = 422;
            throw err;
        }
        notification += "\nНадіслано адміністратором";

        let users = await req.mongoConnection.getUsersByFilter({});

        if(!users || !users.length) {
            req.log.error(`Failed to find users`);
            let err = new Error('Failed to find users');
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
