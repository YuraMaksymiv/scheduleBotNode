const { WizardScene, Stage } = require('telegraf').Scenes;
const { leave } = Stage;

const fs = require("fs");
const list = JSON.parse(fs.readFileSync('constants/lists.json', 'utf8'));

const {User, Schedule} = require('../../../../lib/database');


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

const chooseDayWizard = new WizardScene('chooseDay',
    async (ctx) => {
        let days = [];
        for (let i = 0; i < 5; i++) {
            let day = {text: list.dayNames[i], callback_data: list.dayNames[i] + "_day"};
            days.push(day);
        }

        let row1 = days.slice(0, 2);
        let row2 = days.slice(2, days.length);
        days = [row1, row2];

        const opts = {
            reply_markup: {
                inline_keyboard: days
            }
        };
        await ctx.reply('Виберіть день:', opts);
        return ctx.wizard.next();
    },
    async (ctx) => {
        let action = ctx.update.callback_query.data;
        action = action.split('_');

        let user = await User.getUser(ctx.update.callback_query.from.id);
        let scheduleItems = await Schedule.getSchedule({groupName: user.subGroupsName});
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
            let name = scheduleItems.groupName;
            scheduleItems = scheduleItems.days.filter(i => i.day === action[0])[0];

            let dayLessonsString = "";
            scheduleItems.lesson.forEach(function (l) {
                let str;

                if (l.nameOfLesson[0].lessonName === l.nameOfLesson[1].lessonName) {
                    str = `${l.numberOfLesson}. ${l.nameOfLesson[0].lessonName} (${l.time})\n`;
                } else if (l.nameOfLesson[0].lessonName === "-/-") {
                    str = `${l.numberOfLesson}. п - ${l.nameOfLesson[1].lessonName} (${l.time})\n`;
                } else if (l.nameOfLesson[1].lessonName === "-/-") {
                    str = `${l.numberOfLesson}. н - ${l.nameOfLesson[0].lessonName} (${l.time})\n`;
                } else {
                    str = `${l.numberOfLesson}. н - ${l.nameOfLesson[0].lessonName} (${l.time})\n    п - ${l.nameOfLesson[1].lessonName} (${l.time})\n`;
                }
                dayLessonsString += str;
            });
            await ctx.reply(`Група: ${name}\n ${scheduleItems.day} \n${dayLessonsString}`);
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

chooseDayWizard.hears('Меню', async (ctx) => { await ctx.scene.leave(); await sendMenu(ctx); });

module.exports = chooseDayWizard;
