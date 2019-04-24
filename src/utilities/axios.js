import axios from "axios";
import Tracing from "./tracing";
import moment from 'moment';
import logger from '../config/winston';

axios.interceptors.request.use(
    (config) => {
        config.headers.nginxId = Tracing.correlationId();
        return config
    },
    (error) => {
        return Promise.reject(error);
    });
axios.interceptors.request.use(
    (config) => {
        logger.info('Request: [%s] "%s %s"', moment().utc().format('D/MMM/YYYY:HH:mm:ss ZZ'), config.method.toUpperCase(), config.url);
        return config
    },
    (error) => {
        return Promise.reject(error);
    });

axios.interceptors.response.use((response) => {
    if (response) {
        logger.info('Response: [%s] "%s %s" %s', moment().utc().format('D/MMM/YYYY:HH:mm:ss ZZ'), response.config.method.toUpperCase(), response.config.url, response.status);
    }
    return response
}, (error) => {
    logger.error('Error: [%s] [%s]',
        moment().utc().format('D/MMM/YYYY:HH:mm:ss ZZ'),
        JSON.stringify(error.message)
    );
    return Promise.reject(error);
});

export default axios;
