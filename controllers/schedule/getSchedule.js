
module.exports = async (req, res) => {
    req.log.info(`Start getSchedule controller.`);
    try {
        let schedule = await req.mongoConnection.getSchedule({groupName: req.query.name});
        res.json(schedule);

    } catch (e) {
        console.log(e);
        res.statusCode = e.code;
        res.json(e.message);
    }
};
