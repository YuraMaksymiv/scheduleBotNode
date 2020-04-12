const express = require('express');
const app = express();
const mongoFunction = require("./lib/mongo-util");
const logger = require('./lib/logger.js');
const botFunction = require('./lib/bot');
let mongoConnection, log, bot;

const Promise = require('bluebird');
Promise.config({
    cancellation: true
});

(async () => {
    log = await logger();
    log.info("Logger ready");
    mongoConnection = await mongoFunction();
    log.info("Mongo ready");
    bot = await botFunction(mongoConnection, log);
    log.info("Bot ready");
    app.listen(3000, err => {
        err ? console.log(err) : console.log('Listening 3000...');
    });
})();

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Credentials", true);
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT,DELETE,PATCH");
    res.header("Access-Control-Allow-Headers", "*");
    next();
});

const ApiRouter = require('./routes/API-Router');

app.use(function (req, res, next) {
    req.mongoConnection = mongoConnection;
    req.log = log;
    next();
});

app.use('/api', ApiRouter);

app.use('*', (req, res) => {
    res.status(404).json('Oops')
});



