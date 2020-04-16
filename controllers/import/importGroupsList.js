const excelToJson = require('convert-excel-to-json');

module.exports = async (req, res) => {
    req.log.info("Start importGroupsList controller");
    try {
        let shedule = [];

        let groups = excelToJson({
            sourceFile: 'files/rozklad_imakit.xls',
            range: 'A10:Z10'
        });
        let all = [];

        for (let group in groups) {
            let groupsNames = [];
            for (let groupsKey in groups[group][0]) {
                groupsNames.push(groups[group][0][groupsKey])
            }
            groupsNames.pop();
            groupsNames.splice(0, 2);
            let a = {section: group, groups: groupsNames};
            all.push(a);
        }

        let groupsToDB = [];
        for (let i = 0; i < all.length; i++) {
            let ind = all[i];
            let groupNames = [];
            ind.groups.forEach(function (j) {
                let a = j.split('-');
                if(a[0].slice(-1) === " ") a = a[0].split(' ');
                groupNames.push(a[0]);
            });

            groupNames = groupNames.filter((item, k, ar) => ar.indexOf(item) === k);

            groupNames.forEach(function (k) {
                let groupList = ind.groups.filter(g => g.includes(k));
                groupsToDB.push({
                    groupName: k,
                    groupList: groupList
                })
            });
        }
        let toDB = {
            section: "ІМАКІТ",
            groups: groupsToDB
        };
        await req.mongoConnection.addGroup(toDB);

        return res.json({
            code: 200,
            data: all
        });
    } catch (e) {
        console.log(e);
        res.json({
            code: e.code,
            data: e.message
        });
    }
};
