const { Telegraf, Scenes, session } = require('telegraf');
const { Stage } = Scenes;

//old unfu bot
// const BotToken = '1291886388:AAFe_I-NUyIor1uo4DnfoyW6Hg6wfG6jGNQ';
const BotToken = '1743158030:AAFy78YgVgQBI0C3xECca4uzoceGswskJDQ';

const botMiddleware = require('../middlewares/bot');

const startScene = require('../controllers/bot/start');
const sendNotificationScene = require('../controllers/bot/sendNotification');
const setGroupScene = require('../controllers/bot/setGroup');
const getScheduleToScene = require('../controllers/bot/getScheduleTo');
const weekScene = require('../controllers/bot/schedule/week');
const todayScene = require('../controllers/bot/schedule/today');
const chooseDayScene = require('../controllers/bot/schedule/chooseDay');

module.exports = ( async () => {
    const bot = new Telegraf(BotToken);
    const stage = new Stage([
        startScene,
        sendNotificationScene,
        setGroupScene,
        weekScene,
        todayScene,
        chooseDayScene,
        getScheduleToScene
    ]);
    bot.use(session());
    bot.use(stage.middleware());

    bot.hears('Меню', botMiddleware.sendMenu);

    bot.command('start', (ctx) => ctx.scene.enter('start'));

    bot.hears('Старостам', await botMiddleware.sendToMonitors);
    bot.hears('Надіслати оголошення', await botMiddleware.sendNotification, (ctx) => ctx.scene.enter('sendNotification'));
    bot.hears('Вибрати групу', await botMiddleware.setGroup, (ctx) => ctx.scene.enter('setGroup'));

    bot.hears('Ваш розклад', await botMiddleware.mySchedule);

    bot.hears('На тиждень', (ctx) => ctx.scene.enter('week'));
    bot.hears('На сьогодні', (ctx) => ctx.scene.enter('today'));
    bot.hears('Обрати день', await botMiddleware.chooseDay, (ctx) => ctx.scene.enter('chooseDay'));

    bot.hears('Показати розклад для групи', await botMiddleware.getScheduleTo, (ctx) => ctx.scene.enter('getScheduleTo'));

    bot.launch();

    return bot
})


