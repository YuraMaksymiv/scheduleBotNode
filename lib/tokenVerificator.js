const jwt = require('jsonwebtoken');
let {secret} = require('../constants/secret');

module.exports = (token) => {

    let user = null;

    if (!token) throw new Error('Have not token');

    jwt.verify(token, secret, (err, decoded) => {
        if(err) throw new Error(err.message);

        user = {
            id: decoded.id,
            credentials: decoded.credentials
        }
    });

    if(!user) throw new Error('Not valid token!');

    return user;
};