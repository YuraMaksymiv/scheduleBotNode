const tokinazer = require('../../lib/tokinazer');
const bcrypt = require('bcrypt');

module.exports = async (req, res) => {
    req.log.info(`Start login controller.`);
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
            req.log.error(`Wrong username`);
            let err = new Error('Wrong username');
            err.code = 422;
            throw err;
        }

        const rightPassword = await new Promise((resolve, reject) => {
            bcrypt.compare(password, user.password, (err, result) => {
                if (err) {
                    console.log(err);
                    return reject(err);
                }
                return resolve(result);
            });
        });

        if(!rightPassword) {
            req.log.error(`Wrong password`);
            let err = new Error('Wrong password');
            err.code = 422;
            throw err;
        }

        const accessToken = tokinazer(user.userId, (user.userType ? user.userType : ''));

        res.json({
            code: 200,
            data: accessToken
        });

    } catch (e) {
        console.log(e);
        res.json({
            code: e.code,
            data: e.message
        });
    }
};
