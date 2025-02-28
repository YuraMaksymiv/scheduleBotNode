const types = ["admin", "monitor"];

module.exports = async (req, res) => {
    req.log.info(`Start changeType controller.`);
    try {
        const {userId, type} = req.params;

        if(!types.includes(type)) {
            req.log.error(`Wrong user type`);
            let err = new Error('Wrong user type');
            err.code = 422;
            throw err;
        }

        let user = await req.mongoConnection.getUser(userId);

        if(!user) {
            req.log.error(`Failed to find user`);
            let err = new Error('Failed to find user');
            err.code = 404;
            throw err;
        }

        if(type === 'monitor') {
            if(!user.groupsName) {
                req.log.error(`User must have group`);
                let err = new Error('User must have group');
                err.code = 422;
                throw err;
            }

            let currentMonitor = await req.mongoConnection.getUser({$and: [{userType: "monitor"}, {groupsName: user.groupsName}]});
            if (currentMonitor) await req.mongoConnection.updateUserByFilter({userId: currentMonitor.userId}, {userType: ""});
        }

        let updated = await req.mongoConnection.updateUserByFilter(userId, {userType: type});

        res.json(updated);

    } catch (err) {
        console.log(err);
        res.statusCode = err.code
        res.json(err.message);
    }
};
