const { createLogger, format, transports } = require('winston');
const path = require('path');

const { combine, timestamp, errors, colorize, printf, json } = format;

const devFormat = combine(
    colorize(),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    printf(({ level, message, timestamp, stack, ...meta }) => {
        const metaStr = Object.keys(meta).length
            ? '\n' + JSON.stringify(meta, null, 2)
            : '';
        return `${timestamp} [${level}]: ${message || ''} ${metaStr} ${stack || ''}`;
    })
);

const prodFormat = combine(
    timestamp(),
    errors({ stack: true }),
    json()
);

const logger = createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.NODE_ENV === 'production' ? prodFormat : devFormat,
    defaultMeta: {
        environment: process.env.NODE_ENV || 'development',
        service: 'auth-service'
    },
    transports: [
        new transports.Console(),
        new transports.File({
            filename: path.join('logs', 'error.log'),
            level: 'error'
        }),
        new transports.File({
            filename: path.join('logs', 'combined.log')
        })
    ]
});

module.exports = logger;