const {Schedule} = require('../../lib/database');

module.exports = async (req, res) => {
    req.log.info(`Start getSchedule controller.`);
    try {
        let schedule = await Schedule.getSchedule({groupName: req.query.name});
        res.json(schedule);

    } catch (e) {
        console.log(e);
        res.statusCode = e.code;
        res.json(e.message);
    }
};
