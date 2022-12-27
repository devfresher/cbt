import winston from 'winston'

export const log = function() {
    winston.add(
        new winston.transports.File({
            filename: './logs/uncaughtException.log'
        })
    )

    winston.add(
        new winston.transports.Console({
            colorize: true,
            prettyPrint: true,
        })
    )
}