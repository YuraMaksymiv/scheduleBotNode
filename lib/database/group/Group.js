const mongoose = require('mongoose');
const {Schema} = mongoose;

const GroupListSchema = new Schema({
    mainGroup: {type: String},
    subGroups: {type: Array}
})

const GroupSchema = new Schema({
    groupName: {type: String},
    // groupList: {type: Array}
    groupList: [GroupListSchema]
});

const GroupsSchema = new Schema({
    section: {type: String},
    groups: [GroupSchema]
});

module.exports = mongoose.model('Group', GroupsSchema, 'groups');
