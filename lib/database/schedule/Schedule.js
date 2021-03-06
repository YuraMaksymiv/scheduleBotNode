const mongoose = require('mongoose');
const {Schema} = mongoose;

const DetailedLesson = new Schema({
    lessonName: {type: String},
    isCloned: {type: Boolean}
})

const LessonSchema = new Schema({
    numberOfLesson: {type: String},
    nameOfLesson: [DetailedLesson],
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
