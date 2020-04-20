
module.exports = async (req, res) => {
    req.log.info(`Start getGroupsBySection controller.`);
    try {
        let groups = await req.mongoConnection.getGroup(req.params.section);
        res.json(groups);

    } catch (e) {
        console.log(e);
        res.statusCode = e.code;
        res.json(e.message);
    }
};
