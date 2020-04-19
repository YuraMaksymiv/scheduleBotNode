const ApiRouter = require('express').Router();
const scheduleRouter = require('./schedule');
const groupsRouter = require('./groups');
const userRouter = require('./user');
const importRouter = require('./import');

ApiRouter.use('/schedule', scheduleRouter);
ApiRouter.use('/groups', groupsRouter);
ApiRouter.use('/user', userRouter);
ApiRouter.use('/import', importRouter);

module.exports = ApiRouter;
