import { createLogger, format, transports } from 'winston';

const formatter = format.combine(
  format.colorize(),
  format.timestamp({ format: 'YYYY/MM/DD HH:mm:ss' }),
  format.align(),
  format.printf((info) => {
    const { timestamp, level, message, ...extra } = info;

    return `${timestamp} [${level}]: ${message} ${
      Object.keys(extra).length ? JSON.stringify(extra, null, 2) : ''
    }`;
  }),
);

const logger = createLogger({
  level: 'info',
  format: formatter,
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'combined.log' }),
  ],
  exceptionHandlers: [
    new transports.Console(),
    new transports.File({ filename: 'exceptions.log' }),
  ],
});

export default logger;
