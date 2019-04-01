import {createLogger, format, transports} from 'winston';
const { combine, timestamp, json, splat, printf} = format;


const logger = createLogger({
    format: combine(
        timestamp(),
        splat(),
        json()
    ),
    transports: [
        new transports.Console(),
    ],
    exitOnError: false,
});


export default logger;
