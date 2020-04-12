
module.exports = async (req, res) => {
    req.log.info(`Start updateSchedule controller.`);
    try {
        let schedule = await req.mongoConnection.updateSchedule(req.body.schedule);
        res.json({
            code: 200,
            data: schedule
        });

    } catch (e) {
        console.log(e);
        res.json({
            code: e.code,
            data: e.message
        });
    }
};
