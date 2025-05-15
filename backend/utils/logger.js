const { createLogger, transports, format } = require('winston');

const logger = createLogger({
  format: format.combine(
    format.timestamp(),
    format.printf(({ timestamp, level, message, ...meta }) => {
      const log = {
        time: timestamp,
        level,
        message,
        ...meta
      };
      return JSON.stringify(log);
    })
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'logs/errors.log', level: 'error' }),
    new transports.File({ filename: 'logs/activity.log', level: 'info' }) // ✨ New line
  ]
});

module.exports = logger;
