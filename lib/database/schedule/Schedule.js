const mongoose = require('mongoose');
const {Schema} = mongoose;

const LessonSchema = new Schema({
    numberOfLesson: {type: String},
    nameOfLesson: {type: String},
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

module.exports = mongoose.model('Schedule', ScheduleSchema, 'schedule');
