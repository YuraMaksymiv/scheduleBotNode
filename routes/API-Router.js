const ApiRouter = require('express').Router();
const scheduleRouter = require('./schedule');
const groupsRouter = require('./groups');
const userRouter = require('./user');

ApiRouter.use('/shedule', scheduleRouter);
ApiRouter.use('/groups', groupsRouter);
ApiRouter.use('/user', userRouter);

module.exports = ApiRouter;
