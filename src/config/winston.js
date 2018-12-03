const winston = require('winston');

const options = {
    console: {
        level: process.env.LOG_LEVEL || 'debug',
        handleExceptions: true,
        json: false,
        colorize: true,
    },
};

const logger = new winston.Logger({
    transports: [
        new winston.transports.Console(options.console)
    ],
    exitOnError: false,
});

logger.stream = {
    write: function(message, encoding) {
        logger.info(message);
    },
};

module.exports = logger;
