const { WizardScene, Stage } = require('telegraf').Scenes;
const {User, Schedule} = require('../../../../lib/database');

const fs = require("fs");
const list = JSON.parse(fs.readFileSync('../../../constants/lists.json', 'utf8'));


async function sendMenu (ctx) {
    let keyboard = [["Ваш розклад"], ["Вибрати групу"], ["Показати розклад для групи"]];
    let user = await User.getUser(ctx.update.message.id);
    if(user.userType === "monitor") keyboard.unshift(['Старостам']);
    ctx.reply("Виберіть команду:", {
        "reply_markup": {
            "keyboard": keyboard,
            "one_time_keyboard": false
        }
    });
};

const todayWizard = new WizardScene('today',
    async (ctx) => {
        console.log(`Press /today by ${ctx.update.message.from.id}`);
        let day = new Date().getDay();
        day === 0 ? day = 6 : --day;
        let week = new Date().getWeek();
        week = 7;
        if (week === 1 || week % 2 !== 0) week = 0;
        else week = 1;

        if (day === 5 || day === 6) day = 0;
        let dayName = list.dayNames[day];

        let user = await User.getUser(ctx.update.message.from.id);
        let scheduleItems = await Schedule.getSchedule({groupName: user.groupsName});
        if (!scheduleItems) {
            await ctx.reply('Немає розкладу для цієї групи', {
                "reply_markup": {
                    "keyboard": [["Меню"]],
                    "one_time_keyboard": false,
                    "resize_keyboard": true
                }
            });
            return ctx.scene.leave();
        } else {
            scheduleItems = scheduleItems.days.filter(i => i.day === dayName)[0];

            let dayLessonsString = "";
            scheduleItems.lesson.forEach(function (l) {
                let str;
                str = `${l.numberOfLesson}. ${l.nameOfLesson[week].lessonName} (${l.time})\n`;
                dayLessonsString += str;
            });
            await ctx.reply(`Група: ${user.groupsName}\n ${scheduleItems.day} \n${dayLessonsString}`);
            await ctx.reply('Готово', {
                "reply_markup": {
                    "keyboard": [["Меню"]],
                    "one_time_keyboard": false,
                    "resize_keyboard": true
                }
            });
        }

        return ctx.scene.leave();
    });

todayWizard.hears('Меню', async (ctx) => { await ctx.scene.leave(); await sendMenu(ctx); });

module.exports = todayWizard;
