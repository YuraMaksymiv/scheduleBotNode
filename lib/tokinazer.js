const jwt = require('jsonwebtoken');
const {secret} = require('../constants/secret');

module.exports = (id, credentials) => {
    const token = jwt.sign({id, credentials}, secret, {expiresIn: '30d'});
    if(!token) throw new Error('Tokens was no created');
    return token;
};