const { WizardScene, Stage } = require('telegraf').Scenes;
const { leave } = Stage;

const {User} = require('../../../lib/database');


async function sendMenu (ctx) {
    let keyboard = [["Ваш розклад"], ["Вибрати групу"], ["Показати розклад для групи"]];
    let user = await User.getUser(ctx.update.message.from.id);
    if(user.userType === "monitor") keyboard.unshift(['Старостам']);
    ctx.reply("Виберіть команду:", {
        "reply_markup": {
            "keyboard": keyboard,
            "one_time_keyboard": false
        }
    });
};

const startWizard = new WizardScene('start',
    async (ctx) => {
        console.log('Press /start by ', ctx.update.message.from.id);
        ctx.reply('Введіть будь ласка своє імя:');
        return ctx.wizard.next();
    },
    async (ctx) => {
        ctx.scene.session.name = ctx.update.message.text;
        ctx.reply('Введіть будь ласка своє прізвище:' );
        return ctx.wizard.next();
    },
    async (ctx) => {

        const newUser = {
            name: ctx.scene.session.name,
            firstName: ctx.update.message.text,
            userId: ctx.update.message.from.id,
            username: ctx.update.message.from.username
        }

        await User.addUser(newUser);

        await ctx.reply(`Привіт!`, {
            "reply_markup": {
                "keyboard": [["Меню"], ["Про бота"]],
                "one_time_keyboard": false,
                "resize_keyboard": true
            }
        });
        return ctx.scene.leave();
    });

startWizard.hears('Меню', async (ctx) => { await ctx.scene.leave(); await sendMenu(ctx); });

module.exports = startWizard;
