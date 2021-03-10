const { WizardScene, Stage } = require('telegraf').Scenes;
const { leave } = Stage;

const {User, Group} = require('../../../lib/database');


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

const myScheduleWizard = new WizardScene('mySchedule',
    async (ctx) => {
        let action = ctx.update.callback_query.data;
        action = action.split('_');

        let group = await Group.getGroup(action[0]);
        let groupsToSection = [];

        group.groups.forEach(function (i) {
            let a = {
                text: i.groupName,
                callback_data: i.groupName + "_group" + "_" + action[0] + "_" + action[2]
            };
            groupsToSection.push(a);
        });
        if (groupsToSection.length >= 4 && groupsToSection.length < 8) {
            let row1 = groupsToSection.slice(0, 4);
            let row2 = groupsToSection.slice(4, groupsToSection.length);
            groupsToSection = [row1, row2];
        } else if (groupsToSection.length >= 8 && groupsToSection.length < 12) {
            let row1 = groupsToSection.slice(0, 4);
            let row2 = groupsToSection.slice(4, 8);
            let row3 = groupsToSection.slice(8, groupsToSection.length);
            groupsToSection = [row1, row2, row3];
        } else if (groupsToSection.length >= 12 && groupsToSection.length < 16) {
            let row1 = groupsToSection.slice(0, 4);
            let row2 = groupsToSection.slice(4, 8);
            let row3 = groupsToSection.slice(8, 12);
            let row4 = groupsToSection.slice(12, groupsToSection.length);
            groupsToSection = [row1, row2, row3, row4];
        } else if (groupsToSection.length >= 16) {
            let row1 = groupsToSection.slice(0, 4);
            let row2 = groupsToSection.slice(4, 8);
            let row3 = groupsToSection.slice(8, 12);
            let row4 = groupsToSection.slice(12, 16);
            let row5 = groupsToSection.slice(16, groupsToSection.length);
            groupsToSection = [row1, row2, row3, row4], row5;
        } else groupsToSection = [groupsToSection];

        const opts = {
            reply_markup: {
                inline_keyboard:
                groupsToSection

            }
        };
        ctx.reply('Виберіть імя групи:', opts);

        return ctx.wizard.next();
    },
    async (ctx) => {
        let action = ctx.update.callback_query.data;
        action = action.split('_');
        let groupName = await Group.getGroup(action[2]);
        let groupsNames = [];

        groupName.groups.forEach(function (i) {
            if (i.groupName === action[0]) {
                i.groupList.forEach(function (j) {
                    let a = {
                        text: j,
                        callback_data: j + "_groupName" + "_" + action[0] + "_" + action[2] + "_" + action[3]
                    };
                    groupsNames.push(a);
                })
            }
        });
        if (groupsNames.length >= 4 && groupsNames.length < 8) {
            let row1 = groupsNames.slice(0, 4);
            let row2 = groupsNames.slice(4, groupsNames.length);
            groupsNames = [row1, row2];
        } else if (groupsNames.length >= 8 && groupsNames.length < 12) {
            let row1 = groupsNames.slice(0, 4);
            let row2 = groupsNames.slice(4, 8);
            let row3 = groupsNames.slice(8, groupsNames.length);
            groupsNames = [row1, row2, row3];
        } else if (groupsNames.length >= 12 && groupsNames.length < 16) {
            let row1 = groupsNames.slice(0, 4);
            let row2 = groupsNames.slice(4, 8);
            let row3 = groupsNames.slice(8, 12);
            let row4 = groupsNames.slice(12, groupsNames.length);
            groupsNames = [row1, row2, row3, row4];
        } else if (groupsNames.length >= 16) {
            let row1 = groupsNames.slice(0, 4);
            let row2 = groupsNames.slice(4, 8);
            let row3 = groupsNames.slice(8, 12);
            let row4 = groupsNames.slice(12, 16);
            let row5 = groupsNames.slice(16, groupsNames.length)
            groupsNames = [row1, row2, row3, row4, row5];
        } else groupsNames = [groupsNames];
        const opts = {
            reply_markup: {
                inline_keyboard:
                groupsNames
            }
        };
        ctx.reply('Виберіть групу:', opts);

        return ctx.wizard.next();
    },
    async (ctx) => {
        let action = ctx.update.callback_query.data;
        action = action.split('_');

        let usersGroup = {
            section: action[3],
            group: action[2],
            subGroupsName: action[0]
        };

        console.log(`Save group name: ${action[0]} by ${ctx.update.message.from.id}`);
        let mainGroup = await Group.getMainGroup(usersGroup.section, usersGroup.group, usersGroup.subGroupsName);
        usersGroup.groupsName = mainGroup;
        await User.updateUserGroup(ctx.update.message.from.id, usersGroup);
        await ctx.reply('Готово', {
            "reply_markup": {
                "keyboard": [["Меню"]],
                "one_time_keyboard": false,
                "resize_keyboard": true
            }
        });

        return ctx.scene.leave();
    });

myScheduleWizard.hears('Меню', async (ctx) => { await ctx.scene.leave(); await sendMenu(ctx); });

module.exports = myScheduleWizard;
