
module.exports = async (req, res) => {
    req.log.info(`Start getUsersForGroup controller.`);
    try {
        let users = await req.mongoConnection.getUsersForGroup(req.body.group);
        res.json({
            code: 200,
            data: users
        });

    } catch (e) {
        console.log(e);
        res.json({
            code: e.code,
            data: e.message
        });
    }
};
