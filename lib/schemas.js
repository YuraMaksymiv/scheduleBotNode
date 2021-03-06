// const mongoose = require('mongoose');
// const {Schema} = mongoose;
//
// const UserSchema = new Schema({
//     userId: {type: String},
//     firstName: {type: String},
//     name: {type: String},
//     username: {type: String},
//     userType: {type: String},
//     type: {type: String},
//     group: {type: String},
//     groupsName: {type: String},
//     subGroupsName: {type: String},
//     section: {type: String},
//     password: {type: String}
// }, {timestamps: true});
//
// /////
//
// const GroupListSchema = new Schema({
//     mainGroup: {type: String},
//     subGroups: {type: Array}
// })
//
// const GroupSchema = new Schema({
//     groupName: {type: String},
//     // groupList: {type: Array}
//     groupList: [GroupListSchema]
// });
//
// const GroupsSchema = new Schema({
//     section: {type: String},
//     groups: [GroupSchema]
// });
//
// /////
// const DetailedLesson = new Schema({
//     lessonName: {type: String},
//     isCloned: {type: Boolean}
// })
//
// const LessonSchema = new Schema({
//     numberOfLesson: {type: String},
//     nameOfLesson: [DetailedLesson],
//     time: {type: String}
// });
//
// const DaySchema = new Schema({
//     day: {type: String},
//     isFree: {type: Boolean},
//     lesson: [LessonSchema]
// });
//
// const ScheduleSchema = new Schema({
//     groupName: {type: String},
//     days: [DaySchema]
// });
//
// module.exports = {UserSchema, GroupsSchema, ScheduleSchema};
