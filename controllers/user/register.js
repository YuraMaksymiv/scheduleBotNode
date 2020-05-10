const bcrypt = require('bcrypt');

module.exports = async (req, res) => {
    req.log.info(`Start register controller.`);
    try {
        const {username, password} = req.body;
        if(!username || !password) {
            req.log.error(`Some fields are empty`);
            let err = new Error('Some fields are empty');
            err.code = 422;
            throw err;
        }

        let user = await req.mongoConnection.getUser({username: username});
        if(!user) {
            req.log.error(`User with this username not exists`);
            let err = new Error('User with this username not exists');
            err.code = 422;
            throw err;
        }

        const saltRounds = 10;
        bcrypt.hash(password, saltRounds, async (err, hash) => {
            if (err) {
                console.log(err);
            } else {
                await req.mongoConnection.updateUserByFilter({username: user.username}, {password: hash, userType: "admin"})
            }
        });

        res.json(true);

    } catch (e) {
        console.log(e);
        res.statusCode = e.code;
        res.json(e.message);
    }
};
