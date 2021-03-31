const importClient = require('../../lib/import-util');
const {Schedule, Group} = require('../../lib/database');

module.exports = async (req, res) => {
    req.log.info("Start importSchedule controller");
    try {
        const file = req.file;
        const section = req.query.section;

        if(!file || !section) {
            req.log.error(`Some fields are empty`);
            let err = new Error('Some fields are empty');
            err.code = 422;
            throw err;
        }

        const importedGroups = await importClient.importGroupsList(section, file);
        if(!importedGroups) {
            req.log.error(`Failed file importing`);
            let err = new Error('Failed file importing');
            err.code = 400;
            throw err;
        }

        //save groups names in db
        await Group.updateGroup(importedGroups);

        // const importedSchedule = await importClient.importSchedule(file);
        // if(!importedSchedule) {
        //     req.log.error(`Failed file importing`);
        //     let err = new Error('Failed file importing');
        //     err.code = 400;
        //     throw err;
        // }
        //
        // // save schedule in db
        // for (const key in importedSchedule) {
        //     await Schedule.updateSchedule(importedSchedule[key])
        // }

        return res.json(true);
    } catch (e) {
        console.log(e);
        res.statusCode = e.code
        res.json(e.message);
    }
};
