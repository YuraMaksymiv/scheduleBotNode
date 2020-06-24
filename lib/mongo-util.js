const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
const {UserSchema, GroupsSchema, ScheduleSchema} = require('./schemas');


// helper method to convert obj.id to obj._id to follow
// MongoDB convention.
const normalizeObject = (obj) => {
    // make a shallow copy, rename id field to _id
    const {id, ...rest} = obj;
    return {...rest, _id: id};
};

// Create User Model using User Schema, mapped to users table
const User = mongoose.model('User', UserSchema, 'users');
UserSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (doc, ret) => {
        delete ret._id;
    }
});

// Add utility method to Mongoose model so we can create
// Mongoose object from a JSON object
UserSchema.fromJSON = (obj) => {
    return new User(normalizeObject(obj))
};

// Create Group Model using Group Schema, mapped to users table
const Group = mongoose.model('Group', GroupsSchema, 'groups');
GroupsSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (doc, ret) => {
        delete ret._id;
    }
});

// Add utility method to Mongoose model so we can create
// Mongoose object from a JSON object
GroupsSchema.fromJSON = (obj) => {
    return new Group(normalizeObject(obj))
};

// Create Schedule Model using Schedule Schema, mapped to users table
const Schedule = mongoose.model('Schedule', ScheduleSchema, 'schedule');
ScheduleSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (doc, ret) => {
        delete ret._id;
    }
});

// Add utility method to Mongoose model so we can create
// Mongoose object from a JSON object
ScheduleSchema.fromJSON = (obj) => {
    return new Schedule(normalizeObject(obj))
};


module.exports = ( async () => {
    let conn = await mongoose.connect('mongodb://localhost:27017', {useNewUrlParser: true, useUnifiedTopology: true});
    return {
        getUser: async function (userId) {
            let filter = userId;
            if(typeof filter !== "object") filter = {userId: userId};
            try{
                let u = await User.findOne(filter);
                return u ? u.toJSON() : null;
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
                return u ? u.toJSON() : null;
            }catch (err){
                err.code = 400;
                throw err;
            }
        },

        updateUserByFilter: async function (filter, data) {
            if(typeof filter !== "object") filter = {userId: filter};
            try{
                let u = await User.findOneAndUpdate(filter, data, {new:true, upsert: true});
                return u ? u.toJSON() : null;
            }catch (err){
                err.code = 400;
                throw err;
            }
        },

        updateUserGroup: async function (id, data) {
            try{
                let u = await User.findOneAndUpdate({userId: id}, data);
                return u ? u.toJSON() : null;
            }catch (err){
                err.code = 400;
                throw err;
            }
        },

        addGroup: async function (group) {
            try{
                const u = GroupsSchema.fromJSON(group);
                await u.save();
                return u;
            }catch (err){
                err.code = 400;
                throw err;
            }
        },

        updateGroup: async function (group) {
            try{
                let g = await Group.findOneAndUpdate({section: group.section}, group, {new: true, upsert: true});
                return g ? g.toJSON() : null;
            }catch (err){
                err.code = 400;
                throw err;
            }
        },

        getGroups: async function () {
            try{
                let g = await Group.find();

                return g ? g : null;
            }catch (err){
                err.code = 400;
                throw err;
            }
        },


        getMainGroup: async function (section, groupName, subGroup) {
            try{
                let mainGroup;
                let g = await Group.findOne({section: section});
                if(g) g = g.groups.filter(i => i.groupName === groupName)[0];
                g.groupList.forEach(j => {
                    if(j.subGroups.some(s => s === subGroup)) mainGroup = j.mainGroup;
                })

                return mainGroup ? mainGroup : null;
            }catch (err){
                err.code = 400;
                throw err;
            }
        },

        getGroup: async function (group) {
            try{
                let g = await Group.findOne({section: group});
                if(g) {
                    g = JSON.parse(JSON.stringify(g))
                    g.groups.forEach(i => {
                        let allGroups = [];
                        i.groupList.forEach(j => {
                            allGroups = allGroups.concat(j.subGroups);
                        })
                        i.groupList = allGroups
                    })
                } else g = null;
                return g;
            }catch (err){
                err.code = 400;
                throw err;
            }
        },

        getGroupBySection: async function (group) {
            try{
                let g = await Group.findOne({section: group});

                return g ? g.toJSON() : null;
            }catch (err){
                err.code = 400;
                throw err;
            }
        },

        updateSchedule: async function (schedule) {
            try{
                let s = await Schedule.findOneAndUpdate({groupName: schedule.groupName}, schedule, {new: true, upsert: true});
                return s ? s.toJSON() : null;
            }catch (err){
                err.code = 400;
                throw err;
            }
        },

        getSchedule: async function (filter) {
            try{
                let s = await Schedule.findOne(filter);
                return s ? s.toJSON() : null;
            }catch (err){
                err.code = 400;
                throw err;
            }
        },

        async close() {
            await conn.close();
        }

    }

});
