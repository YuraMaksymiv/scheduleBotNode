const TelegramBot = require('node-telegram-bot-api');
const BotToken = '899520691:AAH0Md6rS-ZIRRdO49zYAn-_TNXXU2tvtjQ';
const fs = require("fs");
const list = JSON.parse(fs.readFileSync('constants/lists.json', 'utf8'));

Date.prototype.getWeek = function () {
    let onejan = new Date(this.getFullYear(), 0, 1);
    let today = new Date(this.getFullYear(), this.getMonth(), this.getDate());
    let dayOfYear = ((today - onejan + 86400000) / 86400000);
    return Math.ceil(dayOfYear / 7)
};

module.exports = ( async (mongoConnection, log) => {
    const bot = new TelegramBot(BotToken, {polling: true});

    // bot.on('message', (msg) => {
    //     console.log(`Message: ${msg.text} from ${msg.chat.username}`);
    // })

    sendMenu = async (msg) => {
        let keyboard = [["See your schedule"], ["Set your group"], ["Get schedule for chosen group"]];
        let user = await mongoConnection.getUser(msg.chat.id);
        if(user.userType === "monitor") keyboard.unshift(['For monitors']);
        bot.sendMessage(msg.chat.id,"Select command", {
            "reply_markup": {
                "keyboard": keyboard,
                "one_time_keyboard": false
            }
        });
    };

    sendNotification = async (msg, user) => {
        let usersFromGroup = await mongoConnection.getUsersForGroup(user.groupsName);
        usersFromGroup = usersFromGroup.filter(i => i.userId !== user.userId);

        for (let i = 0; i < usersFromGroup.length; i++) {
            await bot.sendMessage(usersFromGroup[i].userId, msg.text);
        }
        await bot.sendMessage(msg.chat.id, `Notification send successfully`);
    };

    bot.onText(/\/start/, async (msg) => {
        log.info(`Press /start by ${msg.chat.username}`);
        await mongoConnection.updateUser(msg);
        // bot.sendMessage(msg.chat.id, msg.from.first_name + ', hello! ');
        bot.sendMessage(msg.chat.id,`${msg.from.first_name}, hello!`, {
            "reply_markup": {
                "keyboard": [["Menu"], ["About"]],
                "one_time_keyboard": false,
                "resize_keyboard": true
            }
        });
    });

    bot.onText(/For monitors/, async (msg) => {
        log.info(`Press /for monitors by ${msg.chat.username}`);
        let user = await mongoConnection.getUser(msg.chat.id);
        if(!user || !user.groupsName || !user.userType || user.userType !== "monitor") {
            await bot.sendMessage(msg.chat.id, "You can not go on")
        } else {
            bot.sendMessage(msg.chat.id,"Select command:", {
                "reply_markup": {
                    "keyboard": [["Send notification"], ["Other"]],
                    "one_time_keyboard": false,
                    "resize_keyboard": true
                }
            });
        }

    });

    bot.onText(/Send notification/, async (msg) => {
        log.info(`Press /for monitors by ${msg.chat.username}`);
        let user = await mongoConnection.getUser(msg.chat.id);
        if(!user || !user.groupsName || !user.userType || user.userType !== "monitor") {
            await bot.sendMessage(msg.chat.id, "You can not go on")
        } else {
            await bot.sendMessage(msg.chat.id, `Please, enter your notification for group ${user.groupsName}`);
            bot.on('message',(msg) => {
                if(user.userId === msg.chat.id) {
                    sendNotification(msg, user);
                }
            })
        }
    });

// bot.onText(/Help/, (msg) => {
//     log.info(`Press /help by ${msg.chat.username}`);
//     sendMenu(msg)
// });

    bot.onText(/About/, async (msg) => {
        log.info(`Press /about by ${msg.chat.username}`);
        await bot.sendMessage(msg.chat.id,'Telegram bot for display schedule \n Developed by Yura Maksymiv. v.1.0', {
            "reply_markup": {
                "keyboard": [["Menu"]],
                "one_time_keyboard": false,
                "resize_keyboard": true
            }
        });
    });

    bot.onText(/Menu/, async (msg) => {
        log.info(`Press /menu by ${msg.chat.username}`);
        sendMenu(msg)
    });


    bot.onText(/Set your group/, async function onEditableText(msg) {
        log.info(`Press /setGroup by ${msg.chat.username}`);
        let groups = await mongoConnection.getGroups();
        let sections = [];
        groups.forEach(function (i) {
            sections.push({
                text: i.section,
                callback_data: i.section + "_section_save"
            });
        });
        const opts = {
            reply_markup: {
                inline_keyboard: [
                    sections
                ]
            }
        };
        bot.sendMessage(msg.from.id, 'Choose section', opts);
    });

    bot.onText(/See your schedule/, async (msg) => {
        log.info(`Press /see by ${msg.chat.username}`);
        let user = await mongoConnection.getUser(msg.chat.id);
        if (!user || !user.groupsName) {
            // await bot.sendMessage(msg.chat.id, "You haven't selected your group yet. Please, choose /setGroup to select");
            await bot.sendMessage(msg.chat.id,"You haven't selected your group yet.", {
                "reply_markup": {
                    "keyboard": [["Set your group"]],
                    "one_time_keyboard": false,
                    "resize_keyboard": true
                }
            });
        } else {
            await bot.sendMessage(msg.chat.id,"Schedule for:", {
                "reply_markup": {
                    "keyboard": [["Today"], ["Selected day"], ["All week"]],
                    "one_time_keyboard": false
                }
            });
            // await bot.sendMessage(msg.chat.id, '/today to see your schedule for today');
            // await bot.sendMessage(msg.chat.id, '/chooseDay to see your schedule for selected day');
            // await bot.sendMessage(msg.chat.id, '/week to see your schedule for all week');
        }
    });

    bot.onText(/All week/, async (msg) => {
        log.info(`Press /week by ${msg.chat.username}`);
        let user = await mongoConnection.getUser(msg.chat.id);
        let scheduleItems = await mongoConnection.getSchedule({groupName: user.groupsName});
        if (!scheduleItems) {
            // await bot.sendMessage(msg.chat.id, "There are no schedule for this group yet. Please, go to /menu");
            await bot.sendMessage(msg.chat.id,'There are no schedule for this group yet.', {
                "reply_markup": {
                    "keyboard": [["Menu"]],
                    "one_time_keyboard": false,
                    "resize_keyboard": true
                }
            });
        } else {
            for (let i = 0; i < scheduleItems.days.length; i++) {
                let j = scheduleItems.days[i];
                let dayLessonsString = "";
                j.lesson.forEach(function (l) {
                    let str;
                    if (l.nameOfLesson[0] === l.nameOfLesson[1]) {
                        str = `${l.numberOfLesson}. ${l.nameOfLesson[0]} (${l.time})\n`;
                    } else if (l.nameOfLesson[0] === "0") {
                        str = `${l.numberOfLesson}. п - ${l.nameOfLesson[1]} (${l.time})\n`;
                    } else if (l.nameOfLesson[1] === "0") {
                        str = `${l.numberOfLesson}. н - ${l.nameOfLesson[0]} (${l.time})\n`;
                    } else {
                        str = `${l.numberOfLesson}. н - ${l.nameOfLesson[0]} (${l.time})\n    п - ${l.nameOfLesson[1]} (${l.time})\n`;
                    }
                    dayLessonsString += str;
                });
                await bot.sendMessage(msg.chat.id, `${j.day} \n${dayLessonsString}`)
            }
            bot.sendMessage(msg.chat.id,'Done', {
                "reply_markup": {
                    "keyboard": [["Menu"]],
                    "one_time_keyboard": false
                }
            });
        }
    });

    bot.onText(/Selected day/, async (msg) => {
        log.info(`Press /chooseDay by ${msg.chat.username}`);
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
        bot.sendMessage(msg.from.id, 'Choose day:', opts);
    });

    bot.onText(/Today/, async (msg) => {
        log.info(`Press /today by ${msg.chat.username}`);
        let day = new Date().getDay();
        day === 0 ? day = 6 : --day;
        let week = new Date().getWeek();
        week = 7;
        if (week === 1 || week % 2 !== 0) week = 0;
        else week = 1;

        if (day === 5 || day === 6) day = 0;
        let dayName = list.dayNames[day];

        let user = await mongoConnection.getUser(msg.chat.id);
        let scheduleItems = await mongoConnection.getSchedule({groupName: user.groupsName});
        if (!scheduleItems) {
            // await bot.sendMessage(msg.chat.id, "There are no schedule for this group yet. Please, go to /menu");
            await bot.sendMessage(msg.chat.id,'There are no schedule for this group yet.', {
                "reply_markup": {
                    "keyboard": [["Menu"]],
                    "one_time_keyboard": false,
                    "resize_keyboard": true
                }
            });
        } else {
            scheduleItems = scheduleItems.days.filter(i => i.day === dayName)[0];

            let dayLessonsString = "";
            scheduleItems.lesson.forEach(function (l) {
                let str;
                str = `${l.numberOfLesson}. ${l.nameOfLesson[week]} (${l.time})\n`;
                dayLessonsString += str;
            });
            await bot.sendMessage(msg.chat.id, `${scheduleItems.day} \n${dayLessonsString}`);
            await bot.sendMessage(msg.chat.id,'Done', {
                "reply_markup": {
                    "keyboard": [["Menu"]],
                    "one_time_keyboard": false,
                    "resize_keyboard": true
                }
            });
        }
    });

    bot.onText(/Get schedule for chosen group/, async (msg) => {
        log.info(`Press /getScheduleTo by ${msg.chat.username}`);
        let groups = await mongoConnection.getGroups();
        let sections = [];
        groups.forEach(function (i) {
            sections.push({
                text: i.section,
                callback_data: i.section + "_section_get"
            });
        });
        const opts = {
            reply_markup: {
                inline_keyboard: [
                    sections
                ]
            }
        };
        bot.sendMessage(msg.from.id, 'Choose section', opts);
    });


/////////  CALLBACK QUERY ////////////

    bot.on('callback_query', async function onCallbackQuery(callbackQuery) {
        const msg = callbackQuery.message;
        let action = callbackQuery.data;
        action = action.split('_');

        if (action[1] === "section") {

            let group = await mongoConnection.getGroup(action[0]);
            let groupsToSection = [];

            group.groups.forEach(function (i) {
                let a = {
                    text: i.groupName,
                    callback_data: i.groupName + "_group" + "_" + action[0] + "_" + action[2]
                };
                groupsToSection.push(a);
            });
            if (groupsToSection.length >= 4 && groupsToSection < 8) {
                let row1 = groupsToSection.slice(0, 4);
                let row2 = groupsToSection.slice(4, groupsToSection.length);
                groupsToSection = [row1, row2];
            } else if (groupsToSection.length >= 8 && groupsToSection.length < 12) {
                let row1 = groupsToSection.slice(0, 4);
                let row2 = groupsToSection.slice(4, 8);
                let row3 = groupsToSection.slice(8, groupsToSection.length);
                groupsToSection = [row1, row2, row3];
            } else if (groupsToSection.length >= 12) {
                let row1 = groupsToSection.slice(0, 4);
                let row2 = groupsToSection.slice(4, 8);
                let row3 = groupsToSection.slice(8, 12);
                let row4 = groupsToSection.slice(12, groupsToSection.length);
                groupsToSection = [row1, row2, row3, row4];
            } else groupsToSection = [groupsToSection];

            const opts = {
                reply_markup: {
                    inline_keyboard:
                    groupsToSection

                }
            };
            log.info(`Choose section: ${action[0]} by ${msg.chat.username}`);
            bot.sendMessage(msg.chat.id, 'Choose group', opts);

        } else if (action[1] === "group") {
            let groupName = await mongoConnection.getGroup(action[2]);
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

            if (groupsNames.length >= 4 && groupsNames < 8) {
                let row1 = groupsNames.slice(0, 4);
                let row2 = groupsNames.slice(4, groupsNames.length);
                groupsNames = [row1, row2];
            } else if (groupsNames.length >= 8 && groupsNames.length < 12) {
                let row1 = groupsNames.slice(0, 4);
                let row2 = groupsNames.slice(4, 8);
                let row3 = groupsNames.slice(8, groupsNames.length);
                groupsNames = [row1, row2, row3];
            } else if (groupsNames.length >= 12) {
                let row1 = groupsNames.slice(0, 4);
                let row2 = groupsNames.slice(4, 8);
                let row3 = groupsNames.slice(8, 12);
                let row4 = groupsNames.slice(12, groupsNames.length);
                groupsNames = [row1, row2, row3, row4];
            } else groupsNames = [groupsNames];
            const opts = {
                reply_markup: {
                    inline_keyboard:
                    groupsNames
                }
            };
            log.info(`Choose group: ${action[0]} by ${msg.chat.username}`);
            bot.sendMessage(msg.chat.id, 'Choose group name', opts);
        } else if (action[1] === "groupName") {
            let usersGroup = {
                section: action[3],
                group: action[2],
                groupsName: action[0]
            };
            if (action[4] === "save") {
                log.info(`Save group name: ${action[0]} by ${msg.chat.username}`);
                await mongoConnection.updateUserGroup(msg.chat.id, usersGroup);
                await bot.sendMessage(msg.chat.id,'Done', {
                    "reply_markup": {
                        "keyboard": [["Menu"]],
                        "one_time_keyboard": false,
                        "resize_keyboard": true
                    }
                });
            } else {
                log.info(`Choose group name: ${action[0]} by ${msg.chat.username}`);
                let scheduleItems = await mongoConnection.getSchedule({groupName: action[0]});
                if (!scheduleItems) {
                    // await bot.sendMessage(msg.chat.id, "There are no schedule for this group yet. Please, go to /menu");
                    await bot.sendMessage(msg.chat.id,'There are no schedule for this group yet.', {
                        "reply_markup": {
                            "keyboard": [["Menu"]],
                            "one_time_keyboard": false,
                            "resize_keyboard": true
                        }
                    });
                } else {
                    for (let i = 0; i < scheduleItems.days.length; i++) {
                        let j = scheduleItems.days[i];
                        let dayLessonsString = "";
                        j.lesson.forEach(function (l) {
                            let str;

                            if (l.nameOfLesson[0] === l.nameOfLesson[1]) {
                                str = `${l.numberOfLesson}. ${l.nameOfLesson[0]} (${l.time})\n`;
                            } else if (l.nameOfLesson[0] === "0") {
                                str = `${l.numberOfLesson}. п - ${l.nameOfLesson[1]} (${l.time})\n`;
                            } else if (l.nameOfLesson[1] === "0") {
                                str = `${l.numberOfLesson}. н - ${l.nameOfLesson[0]} (${l.time})\n`;
                            } else {
                                str = `${l.numberOfLesson}. н - ${l.nameOfLesson[0]} (${l.time})\n    п - ${l.nameOfLesson[1]} (${l.time})\n`;
                            }
                            dayLessonsString += str;
                        });
                        await bot.sendMessage(msg.chat.id, `${j.day} \n${dayLessonsString}`);
                    }
                    await bot.sendMessage(msg.chat.id,'Done', {
                        "reply_markup": {
                            "keyboard": [["Menu"]],
                            "one_time_keyboard": false,
                            "resize_keyboard": true
                        }
                    });
                }
            }

        } else if (action[1] === "day") {
            log.info(`Choose day: ${action[0]} by ${msg.chat.username}`);
            let user = await mongoConnection.getUser(msg.chat.id);
            let scheduleItems = await mongoConnection.getSchedule({groupName: user.groupsName});
            if (!scheduleItems) {
                // await bot.sendMessage(msg.chat.id, "There are no schedule for this group yet. Please, go to /menu");
                await bot.sendMessage(msg.chat.id,'There are no schedule for this group yet.', {
                    "reply_markup": {
                        "keyboard": [["Menu"]],
                        "one_time_keyboard": false,
                        "resize_keyboard": true
                    }
                });
            } else {
                scheduleItems = scheduleItems.days.filter(i => i.day === action[0])[0];

                let dayLessonsString = "";
                scheduleItems.lesson.forEach(function (l) {
                    let str;

                    if (l.nameOfLesson[0] === l.nameOfLesson[1]) {
                        str = `${l.numberOfLesson}. ${l.nameOfLesson[0]} (${l.time})\n`;
                    } else if (l.nameOfLesson[0] === "0") {
                        str = `${l.numberOfLesson}. п - ${l.nameOfLesson[1]} (${l.time})\n`;
                    } else if (l.nameOfLesson[1] === "0") {
                        str = `${l.numberOfLesson}. н - ${l.nameOfLesson[0]} (${l.time})\n`;
                    } else {
                        str = `${l.numberOfLesson}. н - ${l.nameOfLesson[0]} (${l.time})\n    п - ${l.nameOfLesson[1]} (${l.time})\n`;
                    }
                    dayLessonsString += str;
                });
                await bot.sendMessage(msg.chat.id, `${scheduleItems.day} \n${dayLessonsString}`);
                await bot.sendMessage(msg.chat.id,'Done', {
                    "reply_markup": {
                        "keyboard": [["Menu"]],
                        "one_time_keyboard": false,
                        "resize_keyboard": true
                    }
                });
            }
        }
    });
})


