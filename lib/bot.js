const TelegramBot = require('node-telegram-bot-api');
const BotToken = '1291886388:AAFe_I-NUyIor1uo4DnfoyW6Hg6wfG6jGNQ';
const fs = require("fs");
const list = JSON.parse(fs.readFileSync('constants/lists.json', 'utf8'));

Date.prototype.getWeek = function () {
    let onejan = new Date(this.getFullYear(), 0, 1);
    let today = new Date(this.getFullYear(), this.getMonth(), this.getDate());
    let dayOfYear = ((today - onejan + 86400000) / 86400000);
    return Math.ceil(dayOfYear / 7)
};

module.exports = ( async (mongoConnection, log, socket) => {
    const bot = new TelegramBot(BotToken, {polling: true});

    bot.on('message', async (msg) => {
        let a = `Message: ${msg.text} from ${msg.chat.username}`;
        socket.sendNewMessageToTheClient('bot_message', a.toString());
    })

    // bot.onText(/\/message/, (msg) => {
    //     console.log(`Message: ${msg.text}`);
    //     console.log(msg);
    //     let a = bot.getUpdates();
    //     console.log(a);
    // })

    sendMenu = async (msg) => {
        let keyboard = [["Ваш розклад"], ["Вибрати групу"], ["Показати розклад для групи"], ["Карти"]];
        let user = await mongoConnection.getUser(msg.chat.id);
        if(user.userType === "monitor") keyboard.unshift(['Старостам']);
        bot.sendMessage(msg.chat.id,"Виберіть команду:", {
            "reply_markup": {
                "keyboard": keyboard,
                "one_time_keyboard": false
            }
        });
    };

    sendNotification = async (msg, user) => {
        let usersFromGroup = await mongoConnection.getUsersForGroup(user.groupsName);
        usersFromGroup = usersFromGroup.filter(i => i.userId !== user.userId);
        msg.text += '\n Відправлено старостою'

        for (let i = 0; i < usersFromGroup.length; i++) {
            await bot.sendMessage(usersFromGroup[i].userId, msg.text);
        }
        await bot.sendMessage(msg.chat.id, `Оголошення відправлене`);
    };

    bot.onText(/\/start/, async (msg) => {
        log.info(`Press /start by ${msg.chat.id}`);
        let name;
        let currentUser = msg.chat.id;
        let isFirstNameDone = false, isNameDone = false;
        await bot.sendMessage(msg.chat.id, 'Введіть будь ласка своє імя:');
        await bot.on('message', async (msg) => {
            if(!isNameDone && currentUser === msg.chat.id) {
                isNameDone = true
                name = {name: msg.text};
                await bot.sendMessage(msg.chat.id, 'Введіть будь ласка своє прізвище:');
                await bot.on('message', async (msg1) => {
                    if(!isFirstNameDone && currentUser === msg1.chat.id) {
                        name.firstName = msg1.text;
                        isFirstNameDone = true;
                        await bot.sendMessage(msg.chat.id,`Привіт!`, {
                            "reply_markup": {
                                "keyboard": [["Меню"], ["Про бота"]],
                                "one_time_keyboard": false,
                                "resize_keyboard": true
                            }
                        });
                        await mongoConnection.updateUser(msg);
                        await mongoConnection.updateUserByFilter({userId: msg.chat.id}, name);
                    }
                })
            }
        })

    });

    bot.onText(/Старостам/, async (msg) => {
        log.info(`Press /for monitors by ${msg.chat.id}`);
        let user = await mongoConnection.getUser(msg.chat.id);
        if(!user || !user.groupsName || !user.userType || user.userType !== "monitor") {
            await bot.sendMessage(msg.chat.id, "Доступ заборонено")
        } else {
            bot.sendMessage(msg.chat.id,"Виберіть команду:", {
                "reply_markup": {
                    "keyboard": [["Надіслати оголошення"], ["Меню"]],
                    "one_time_keyboard": false,
                    "resize_keyboard": true
                }
            });
        }

    });

    bot.on('location', async (msg) => {
        console.log(msg.location.latitude);
        console.log(msg.location.longitude);
        await mongoConnection.addLocation(msg.location.latitude, msg.location.longitude);
    });

    bot.onText(/Карти/, async (msg) => {
        log.info(`Press /maps by ${msg.chat.id}`);
        bot.sendLocation(msg.chat.id, "49.807077", "24.001523");

    });

    bot.onText(/Надіслати оголошення/, async (msg) => {
        log.info(`Press /send notification by ${msg.chat.id}`);
        let user = await mongoConnection.getUser(msg.chat.id);
        if(!user || !user.groupsName || !user.userType || user.userType !== "monitor") {
            await bot.sendMessage(msg.chat.id, "Доступ заборонено")
        } else {
            let isSended = false;
            await bot.sendMessage(msg.chat.id, `Введіть будь ласка оголошення для групи: ${user.groupsName}`);
            bot.on('message',(msg) => {
                if(user.userId == msg.chat.id && !isSended) {
                    sendNotification(msg, user);
                    isSended = true;
                }
            })
        }
    });


    bot.onText(/Про бота/, async (msg) => {
        log.info(`Press /about by ${msg.chat.id}`);
        await bot.sendMessage(msg.chat.id,'Telegram bot for display schedule \n Developed by Yura Maksymiv. v.2.0', {
            "reply_markup": {
                "keyboard": [["Меню"]],
                "one_time_keyboard": false,
                "resize_keyboard": true
            }
        });
    });

    bot.onText(/Меню/, async (msg) => {
        log.info(`Press /menu by ${msg.chat.id}`);
        sendMenu(msg)
    });


    bot.onText(/Вибрати групу/, async function onEditableText(msg) {
        log.info(`Press /setGroup by ${msg.chat.id}`);
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
        bot.sendMessage(msg.from.id, 'Виберіть інститут:', opts);
    });

    bot.onText(/Ваш розклад/, async (msg) => {
        log.info(`Press /see by ${msg.chat.id}`);
        let user = await mongoConnection.getUser(msg.chat.id);
        if (!user || !user.groupsName) {
            // await bot.sendMessage(msg.chat.id, "You haven't selected your group yet. Please, choose /setGroup to select");
            await bot.sendMessage(msg.chat.id,"Ви ще не обрали вашу групу", {
                "reply_markup": {
                    "keyboard": [["Вибрати групу:"]],
                    "one_time_keyboard": false,
                    "resize_keyboard": true
                }
            });
        } else {
            await bot.sendMessage(msg.chat.id,"Показати розклад:", {
                "reply_markup": {
                    "keyboard": [["На сьогодні"], ["Обрати день"], ["На тиждень"]],
                    "one_time_keyboard": false
                }
            });
            // await bot.sendMessage(msg.chat.id, '/today to see your schedule for today');
            // await bot.sendMessage(msg.chat.id, '/chooseDay to see your schedule for selected day');
            // await bot.sendMessage(msg.chat.id, '/week to see your schedule for all week');
        }
    });

    bot.onText(/На тиждень/, async (msg) => {
        log.info(`Press /week by ${msg.chat.id}`);
        let user = await mongoConnection.getUser(msg.chat.id);
        let scheduleItems = await mongoConnection.getSchedule({groupName: user.subGroupsName});
        if (!scheduleItems) {
            // await bot.sendMessage(msg.chat.id, "There are no schedule for this group yet. Please, go to /menu");
            await bot.sendMessage(msg.chat.id,'Немає розкладу для цієї групи', {
                "reply_markup": {
                    "keyboard": [["Меню"]],
                    "one_time_keyboard": false,
                    "resize_keyboard": true
                }
            });
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
            await bot.sendMessage(msg.chat.id, allString)
            bot.sendMessage(msg.chat.id,'Готово', {
                "reply_markup": {
                    "keyboard": [["Меню"]],
                    "one_time_keyboard": false
                }
            });
        }
    });

    bot.onText(/Обрати день/, async (msg) => {
        log.info(`Press /chooseDay by ${msg.chat.id}`);
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
        bot.sendMessage(msg.from.id, 'Виберіть день:', opts);
    });

    bot.onText(/На сьогодні/, async (msg) => {
        log.info(`Press /today by ${msg.chat.id}`);
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
            await bot.sendMessage(msg.chat.id,'Немає розкладу для цієї групи', {
                "reply_markup": {
                    "keyboard": [["Меню"]],
                    "one_time_keyboard": false,
                    "resize_keyboard": true
                }
            });
        } else {
            scheduleItems = scheduleItems.days.filter(i => i.day === dayName)[0];

            let dayLessonsString = "";
            scheduleItems.lesson.forEach(function (l) {
                let str;
                str = `${l.numberOfLesson}. ${l.nameOfLesson[week].lessonName} (${l.time})\n`;
                dayLessonsString += str;
            });
            await bot.sendMessage(msg.chat.id, `Група: ${user.groupsName}\n ${scheduleItems.day} \n${dayLessonsString}`);
            await bot.sendMessage(msg.chat.id,'Готово', {
                "reply_markup": {
                    "keyboard": [["Меню"]],
                    "one_time_keyboard": false,
                    "resize_keyboard": true
                }
            });
        }
    });

    bot.onText(/Показати розклад для групи/, async (msg) => {
        log.info(`Press /getScheduleTo by ${msg.chat.id}`);
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
        bot.sendMessage(msg.from.id, 'Виберіть інститут:', opts);
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
            log.info(`Choose section: ${action[0]} by ${msg.chat.id}`);
            bot.sendMessage(msg.chat.id, 'Виберіть імя групи:', opts);

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
            log.info(`Choose group: ${action[0]} by ${msg.chat.id}`);
            bot.sendMessage(msg.chat.id, 'Виберіть групу:', opts);
        } else if (action[1] === "groupName") {
            let usersGroup = {
                section: action[3],
                group: action[2],
                subGroupsName: action[0]
            };
            if (action[4] === "save") {
                log.info(`Save group name: ${action[0]} by ${msg.chat.id}`);
                let mainGroup = await mongoConnection.getMainGroup(usersGroup.section, usersGroup.group, usersGroup.subGroupsName);
                usersGroup.groupsName = mainGroup;
                await mongoConnection.updateUserGroup(msg.chat.id, usersGroup);
                await bot.sendMessage(msg.chat.id,'Готово', {
                    "reply_markup": {
                        "keyboard": [["Меню"]],
                        "one_time_keyboard": false,
                        "resize_keyboard": true
                    }
                });
            } else {
                log.info(`Choose group name: ${action[0]} by ${msg.chat.id}`);
                let scheduleItems = await mongoConnection.getSchedule({groupName: action[0]});
                if (!scheduleItems) {
                    // await bot.sendMessage(msg.chat.id, "There are no schedule for this group yet. Please, go to /menu");
                    await bot.sendMessage(msg.chat.id,'Немає розкладу для цієї групи', {
                        "reply_markup": {
                            "keyboard": [["Меню"]],
                            "one_time_keyboard": false,
                            "resize_keyboard": true
                        }
                    });
                } else {
                    let name = scheduleItems.groupName;
                    let allString = `Група: ${name}\n`;
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
                        allString += `${j.day} \n${dayLessonsString}\n`;

                    }
                    await bot.sendMessage(msg.chat.id, allString);
                    await bot.sendMessage(msg.chat.id,'Готово', {
                        "reply_markup": {
                            "keyboard": [["Меню"]],
                            "one_time_keyboard": false,
                            "resize_keyboard": true
                        }
                    });
                }
            }

        } else if (action[1] === "day") {
            log.info(`Choose day: ${action[0]} by ${msg.chat.id}`);
            let user = await mongoConnection.getUser(msg.chat.id);
            let scheduleItems = await mongoConnection.getSchedule({groupName: user.subGroupsName});
            if (!scheduleItems) {
                // await bot.sendMessage(msg.chat.id, "There are no schedule for this group yet. Please, go to /menu");
                await bot.sendMessage(msg.chat.id,'Немає розкладу для цієї групи', {
                    "reply_markup": {
                        "keyboard": [["Меню"]],
                        "one_time_keyboard": false,
                        "resize_keyboard": true
                    }
                });
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
                await bot.sendMessage(msg.chat.id, `Група: ${name}\n ${scheduleItems.day} \n${dayLessonsString}`);
                await bot.sendMessage(msg.chat.id,'Готово', {
                    "reply_markup": {
                        "keyboard": [["Меню"]],
                        "one_time_keyboard": false,
                        "resize_keyboard": true
                    }
                });
            }
        }
    });
    return bot
})


