const User = require('./User');

module.exports = {
    addUser: function (userData) {
        return User.findOneAndUpdate({userId: userData.userId}, userData, {new: true, upsert: true});
    },

    getUser: async function (userId) {
        let filter = userId;
        if(typeof filter !== "object") filter = {userId: userId};
        try{
            let u = await User.findOne(filter);
            return u ? u : null;
        }catch (err){
            err.code = 400;
            throw err;
        }
    },

    getUsers: async function (perPage, page, filter, sort) {
        try{
            let u = await User.aggregate([
                {$match: filter},
                {$sort: sort},
                {$skip: perPage * (page-1)},
                {$limit: perPage}
            ]);
            return u ? u : null;
        }catch (err){
            err.code = 400;
            throw err;
        }
    },

    getUsersByFilter: async function (filter) {
        if(typeof filter !== "object") filter = {userId: filter};
        try{
            let u = await User.find(filter);
            return u ? u : null;
        }catch (err){
            err.code = 400;
            throw err;
        }
    },

    getUsersForGroup: async function (groupName) {
        try{
            let u = await User.find({groupsName: groupName});
            return u ? u : null;
        }catch (err){
            err.code = 400;
            throw err;
        }
    },

    updateUser: async function (msg) {
        try{
            let user = {
                userId: msg.chat.id,
                firstName: msg.chat.first_name,
                username: msg.chat.username,
                type: msg.chat.type
            };
            let u = await User.findOneAndUpdate({userId: msg.chat.id}, user, {new:true, upsert: true});
            return u ? u : null;
        }catch (err){
            err.code = 400;
            throw err;
        }
    },

    updateUserByFilter: async function (filter, data) {
        if(typeof filter !== "object") filter = {userId: filter};
        try{
            let u = await User.findOneAndUpdate(filter, data, {new:true, upsert: true});
            return u ? u : null;
        }catch (err){
            err.code = 400;
            throw err;
        }
    },

    updateUserGroup: async function (id, data) {
        try{
            let u = await User.findOneAndUpdate({userId: id}, data);
            return u ? u : null;
        }catch (err){
            err.code = 400;
            throw err;
        }
    }
}
