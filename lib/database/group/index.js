const Group = require('./Group');

module.exports = {
    addGroup: async function (group) {
        try{
            return Group.add(group);
        }catch (err){
            err.code = 400;
            throw err;
        }
    },

    updateGroup: async function (group) {
        try{
            let g = await Group.findOneAndUpdate({section: group.section}, group, {new: true, upsert: true});
            return g ? g : null;
        }catch (err){
            err.code = 400;
            throw err;
        }
    },

    getGroups: async function () {
        try{
            let g = await Group.find();

            return g ? g : null;
        }catch (err){
            err.code = 400;
            throw err;
        }
    },


    getMainGroup: async function (section, groupName, subGroup) {
        try{
            let mainGroup;
            let g = await Group.findOne({section: section});
            if(g) g = g.groups.filter(i => i.groupName === groupName)[0];
            g.groupList.forEach(j => {
                if(j.subGroups.some(s => s === subGroup)) mainGroup = j.mainGroup;
            })

            return mainGroup ? mainGroup : null;
        }catch (err){
            err.code = 400;
            throw err;
        }
    },

    getGroup: async function (group) {
        try{
            let g = await Group.findOne({section: group});
            if(g) {
                g = JSON.parse(JSON.stringify(g))
                g.groups.forEach(i => {
                    let allGroups = [];
                    i.groupList.forEach(j => {
                        allGroups = allGroups.concat(j.subGroups);
                    })
                    i.groupList = allGroups
                })
            } else g = null;
            return g;
        }catch (err){
            err.code = 400;
            throw err;
        }
    },

    getGroupBySection: async function (group) {
        try{
            let g = await Group.findOne({section: group});

            return g ? g() : null;
        }catch (err){
            err.code = 400;
            throw err;
        }
    }
}
