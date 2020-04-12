const mongoose = require('mongoose');
const {Schema} = mongoose;

const UserSchema = new Schema({
    userId: {type: String},
    firstName: {type: String},
    username: {type: String},
    userType: {type: String},
    type: {type: String},
    group: {type: String},
    groupsName: {type: String},
    section: {type: String}
}, {timestamps: true});

/////

const GroupSchema = new Schema({
    groupName: {type: String},
    groupList: {type: Array}
});

const GroupsSchema = new Schema({
    section: {type: String},
    groups: [GroupSchema]
});

/////

const LessonSchema = new Schema({
    numberOfLesson: {type: String},
    nameOfLesson: {type: Array},
    time: {type: String}
});

const DaySchema = new Schema({
    day: {type: String},
    isFree: {type: Boolean},
    lesson: [LessonSchema]
});

const ScheduleSchema = new Schema({
    groupName: {type: String},
    days: [DaySchema]
});

module.exports = {UserSchema, GroupsSchema, ScheduleSchema};