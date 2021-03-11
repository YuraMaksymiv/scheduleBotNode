const jwt = require('jsonwebtoken');
let {secret} = require('../constants/secret');
const {User} = require('../lib/database')

module.exports = async (req, res, next) => {
    let token = req.headers.token;
    let user, userData;

    if (!token) {
        req.log.error(`Token not exists`);
        res.status(401).json('Token not exists');
    } else {
        jwt.verify(token, secret, (err, decoded) => {
            try {
                userData = decoded
            } catch (err) {
                throw new Error(err.message);
            }
        });

        if(userData) {
            let date = new Date()
            if(date > new Date(userData.exp * 1000)) {
                req.log.error(`Token is expired`);
                res.status(401).json('Token is expired');
            }
            user = await User.getUser(userData.id);
        }

        if(!user || !userData) {
            req.log.error(`Token is not valid`);
            res.status(401).json('Token is not valid');
        } else next()
    }
};
