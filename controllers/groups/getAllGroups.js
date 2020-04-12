
module.exports = async (req, res) => {
    req.log.info(`Start getAllGroups controller.`);
    try {
        let groups = await req.mongoConnection.getGroups();
        
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
