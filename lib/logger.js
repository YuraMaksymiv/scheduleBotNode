const winston = require('winston'),
    format = winston.format;

/**
 * Convenience function to initialize winston logger
 * @param context
 * @returns {*}
 */
function initLogger() {
    const transformer = format(info => {
        if (info.meta && info.meta instanceof Error) {
            info.meta = {
                message: info.meta.message,
                stack: info.meta.stack
            };
        }
        return info;
    })();
    let log = winston.createLogger({
        format: format.combine(
            // To handle % references in message
            format.splat(),
            format.timestamp({
                format: 'YYYY-MM-DD HH:mm:ss,SS'
            }),
            // Handle error objects
            transformer, format.json()
        ),
        transports: [new winston.transports.Console({
            level: "info",
            handleExceptions: true
        })]
    });
    return log;
}

function shutdownLogger(log) {
    if (log && log.exceptions) {
        log.exceptions.unhandle();
        log.close();
    }
}

initLogger.shutdownLogger = shutdownLogger;
module.exports = initLogger;
