
module.exports = async (req, res) => {
    req.log.info(`Start getGroupsBySection controller.`);
    try {
        let groups = await req.mongoConnection.getGroup(req.params.section);
        res.json({
            code: 200,
            data: groups
        });

    } catch (e) {
        console.log(e);
        res.json({
            code: e.code,
            data: e.message
        });
    }
};
