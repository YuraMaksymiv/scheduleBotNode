const {Schedule} = require('../../lib/database');

module.exports = async (req, res) => {
    req.log.info(`Start updateSchedule controller.`);
    try {
        let schedule = await Schedule.updateSchedule(req.body.schedule);
        res.json({
            code: 200,
            data: schedule
        });

    } catch (e) {
        console.log(e);
        res.statusCode = e.code;
        res.json(e.message);
    }
};
