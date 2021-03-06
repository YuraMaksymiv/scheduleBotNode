const Schedule = require('./Schedule');

module.exports = {
    updateSchedule: async function (schedule) {
        try{
            let s = await Schedule.findOneAndUpdate({groupName: schedule.groupName}, schedule, {new: true, upsert: true});
            return s ? s() : null;
        }catch (err){
            err.code = 400;
            throw err;
        }
    },

    getSchedule: async function (filter) {
        try{
            let s = await Schedule.findOne(filter);
            return s ? s() : null;
        }catch (err){
            err.code = 400;
            throw err;
        }
    },
}
