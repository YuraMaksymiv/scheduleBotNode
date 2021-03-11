const {Group} = require('../../lib/database');

module.exports = async (req, res) => {
    req.log.info(`Start getMainGroupsBySection controller.`);
    try {
        let mainGroups = []
        let groups = await Group.getGroupBySection(req.params.section);
        if(groups && groups.groups.length) {
            groups.groups.forEach(i => {
                i.groupList.forEach(j => {
                    mainGroups.push(j.mainGroup);
                })
            })
        }

        res.json(mainGroups);

    } catch (e) {
        console.log(e);
        res.statusCode = e.code;
        res.json(e.message);
    }
};
