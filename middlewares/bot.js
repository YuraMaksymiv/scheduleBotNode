const {User, Group} = require('../lib/database');
const logger = require('../lib/logger.js');
const log = logger();

Date.prototype.getWeek = function () {
    let onejan = new Date(this.getFullYear(), 0, 1);
    let today = new Date(this.getFullYear(), this.getMonth(), this.getDate());
    let dayOfYear = ((today - onejan + 86400000) / 86400000);
    return Math.ceil(dayOfYear / 7)
};

module.exports = {
    sendMenu: async (ctx) => {
        let keyboard = [["Ваш розклад"], ["Вибрати групу"], ["Показати розклад для групи"]];
        let user = await User.getUser(ctx.update.message.from.id);
        if(user.userType === "monitor") keyboard.unshift(['Старостам']);
        ctx.reply("Виберіть команду:", {
            "reply_markup": {
                "keyboard": keyboard,
                "one_time_keyboard": false
            }
        });
    },

    sendToMonitors: async (ctx) => {
        log.info(`Press /for monitors by ${ctx.update.message.from.id}`);
        let user = await User.getUser(ctx.update.message.from.id);
        if (!user || !user.groupsName || !user.userType || user.userType !== "monitor") {
            ctx.reply("Доступ заборонено")
        } else {
            ctx.reply("Виберіть команду:", {
                "reply_markup": {
                    "keyboard": [["Надіслати оголошення"], ["Меню"]],
                    "one_time_keyboard": false,
                    "resize_keyboard": true
                }
            });
        }
    },

    sendNotification: async (ctx, next) => {
        log.info(`Press /send notification by ${ctx.update.message.from.id}`);
        let user = await User.getUser(ctx.update.message.from.id);
        if(!user || !user.groupsName || !user.userType || user.userType !== "monitor") {
            return ctx.reply("Доступ заборонено")
        } else {
            await ctx.reply(`Введіть будь ласка оголошення для групи: ${user.groupsName}`);
            return next();
        }
    },

    setGroup: async (ctx, next) => {
        log.info(`Press /setGroup by ${ctx.update.message.from.id}`);
        ctx.reply("Оберіть свою групу", {
            "reply_markup": {
                "keyboard": [["Меню"]],
                "one_time_keyboard": false,
                "resize_keyboard": true
            }
        });
        return await next();
    },

    mySchedule: async (ctx) => {
        log.info(`Press /see by ${ctx.update.message.from.id}`);
        let user = await User.getUser(ctx.update.message.from.id);
        if (!user || !user.groupsName) {
            ctx.reply("Ви ще не обрали вашу групу", {
                "reply_markup": {
                    "keyboard": [["Вибрати групу:"]],
                    "one_time_keyboard": false,
                    "resize_keyboard": true
                }
            });
        } else {
            ctx.reply("Показати розклад:", {
                "reply_markup": {
                    "keyboard": [["На сьогодні"], ["Обрати день"], ["На тиждень"]],
                    "one_time_keyboard": false
                }
            });
        };
    },

    week: async (ctx) => {
        log.info(`Press /see by ${ctx.update.message.from.id}`);
        let user = await User.getUser(ctx.update.message.from.id);
        if (!user || !user.groupsName) {
            ctx.reply("Ви ще не обрали вашу групу", {
                "reply_markup": {
                    "keyboard": [["Вибрати групу:"]],
                    "one_time_keyboard": false,
                    "resize_keyboard": true
                }
            });
        } else {
            ctx.reply("Показати розклад:", {
                "reply_markup": {
                    "keyboard": [["На сьогодні"], ["Обрати день"], ["На тиждень"]],
                    "one_time_keyboard": false
                }
            });
        };
    },

    chooseDay: async (ctx, next) => {
        log.info(`Press /chooseDay by ${ctx.update.message.from.id}`);
        ctx.reply("Розклад для дня", {
            "reply_markup": {
                "keyboard": [["Меню"]],
                "one_time_keyboard": false,
                "resize_keyboard": true
            }
        });
        return next();
    },

    getScheduleTo: async (ctx, next) => {
        log.info(`Press /getScheduleTo by ${ctx.update.message.from.id}`);
        ctx.reply("Розклад для групи", {
            "reply_markup": {
                "keyboard": [["Меню"]],
                "one_time_keyboard": false,
                "resize_keyboard": true
            }
        });
        return next();
    }
}
