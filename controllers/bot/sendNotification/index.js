const {Telegraf} = require('telegraf');
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

const sendNotificationWizard = new WizardScene('sendNotification',
    async (ctx) => {
        const user = await User.getUser(ctx.update.message.from.id);
        let usersFromGroup = await User.getUsersForGroup(user.groupsName);
        usersFromGroup = usersFromGroup.filter(i => i.userId !== user.userId);

        let messageText = ctx.update.message.text;
        messageText += '\n Відправлено старостою'

        for (let i = 0; i < usersFromGroup.length; i++) {
            await Telegraf.Telegram.sendMessage(usersFromGroup[i].userId, messageText);
        }
        await ctx.reply(`Оголошення відправлене`);
        return ctx.scene.leave();
    });

sendNotificationWizard.hears('Меню', async (ctx) => { await ctx.scene.leave(); await sendMenu(ctx); });

module.exports = sendNotificationWizard;
