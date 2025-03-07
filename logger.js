const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf } = format;

// Define your custom format
const myFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} [${level}]: ${message}`;
});

const logger = (logFile) => {
    return createLogger({
        level: 'debug',
        format: combine(
            timestamp(),
            myFormat
        ),
        transports: [
            new transports.Console({ level: 'info' }), // Logs everything to console
            new transports.File({ filename: `./logs/${logFile}.log`, level: 'debug' })

        ]

    })
};

module.exports = logger;
