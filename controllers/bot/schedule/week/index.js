const { WizardScene, Stage } = require('telegraf').Scenes;
const {User, Schedule} = require('../../../../lib/database');


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

const weekWizard = new WizardScene('week',
    async (ctx) => {
        console.log(`Press /week by ${ctx.update.message.from.id}`);
        let user = await User.getUser(ctx.update.message.from.id);
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
            let allString = `Група: ${user.groupsName}`;
            for (let i = 0; i < scheduleItems.days.length; i++) {
                let j = scheduleItems.days[i];
                let dayLessonsString = "";
                j.lesson.forEach(function (l) {
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
                allString += `${j.day} \n${dayLessonsString}\n`
            }
            await ctx.reply(allString)
            await ctx.reply('Готово', {
                "reply_markup": {
                    "keyboard": [["Меню"]],
                    "one_time_keyboard": false
                }
            });
        }

        return ctx.scene.leave();
    });

weekWizard.hears('Меню', async (ctx) => { await ctx.scene.leave(); await sendMenu(ctx); });

module.exports = weekWizard;
