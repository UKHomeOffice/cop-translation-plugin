import {createLogger, format, transports} from 'winston';
import Tracing from "../utilities/tracing";

const { combine, timestamp, json, splat} = format;

const addCorrelationId = format((info) => {
    info.correlationId = Tracing.correlationId();
    return info;
});

const {
    TRANSLATION_LOG_LEVEL,
} = process.env;

const logger = createLogger({
    level: TRANSLATION_LOG_LEVEL || 'info',
    format: combine(
        timestamp(),
        splat(),
        addCorrelationId(),
        json()
    ),
    transports: [
        new transports.Console(),
    ],
    exitOnError: false,
});


export default logger;
