
module.exports = async (req, res) => {
    req.log.info(`Start getSchedule controller.`);
    try {
        let schedule = await req.mongoConnection.getSchedule({groupName: req.query.name});
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
