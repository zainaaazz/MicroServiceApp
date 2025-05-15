const { createLogger, transports, format } = require('winston');

const securityLogger = createLogger({
  format: format.combine(
    format.timestamp(),
    format.printf(({ timestamp, level, message, ...meta }) => {
      return `${timestamp} | ${level.toUpperCase()} | ${message} ${JSON.stringify(meta)}`;
    })
  ),
  transports: [
    new transports.File({ filename: 'logs/security.log', level: 'warn' })
  ]
});

module.exports = securityLogger;
