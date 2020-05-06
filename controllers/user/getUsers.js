
module.exports = async (req, res) => {
    req.log.info(`Start getUsers controller.`);
    try {
        let filter = {$and: []};
        const page = req.body.currentPage ? parseInt(req.body.currentPage) : 1;
        const perPage = req.body.itemsPerPage ? parseInt(req.body.itemsPerPage) : 10;

        if(req.body.filter) {
            if(req.body.filter.userType) {
                filter.$and.push({userType: req.body.filter.userType})
            }
            if(req.body.filter.section) {
                filter.$and.push({section: req.body.filter.section})
            }
            if(req.body.filter.group) {
                filter.$and.push({group: req.body.filter.group})
            }
        }

        if(req.body.search) {
            let regex = { $regex: req.body.search, $options:'gi' };
            filter.$and.push({ $or: [ { 'firstName': regex }, { 'name': regex }, { 'groupsName': regex } ] });
        }

        let sort = {'createdAt': -1}
        if (req.body.sort) {
            let sortValue = req.body.sort;
            if (sortValue.name) {
                sort = { 'firstName':sortValue.name, 'name':sortValue.name };
            }
            if (sortValue.userId) {
                sort = { 'userId':sortValue.userId };
            }
            if (sortValue.username) {
                sort = { 'username':sortValue.username };
            }
            if (sortValue.createdAt) {
                sort = { 'createdAt':sortValue.userId };
            }
            if (sortValue.groupsName) {
                sort = { 'groupsName':sortValue.groupsName };
            }
        }

        if(!filter.$and.length) filter = {};

        let users = await req.mongoConnection.getUsers(perPage, page, filter, sort);
        let count = users ? users.length : 0;
        res.json({users: users, count: count});

    } catch (e) {
        console.log(e);
        res.statusCode = e.code;
        res.json(e.message);
    }
};
