const mongoose = require('mongoose');
const {Schema} = mongoose;

const UserSchema = new Schema({
    userId: {type: String},
    firstName: {type: String},
    name: {type: String},
    username: {type: String},
    userType: {type: String},
    type: {type: String},
    group: {type: String},
    groupsName: {type: String},
    section: {type: String},
    password: {type: String}
}, {timestamps: true});

module.exports = mongoose.model('User', UserSchema, 'users');
