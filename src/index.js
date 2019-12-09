import DataContextFactory from "./services/DataContextFactory";
import ProcessService from "./services/ProcessService";
import appConfig from "./config/appConfig";
import BusinessKeyGenerator from "./services/BusinessKeyGenerator";
import PlatformDataService from "./services/PlatformDataService";
import Redis from "ioredis";
import logger from "./config/winston";


const processService = new ProcessService(appConfig);

const checkRedisSSL = (redisSSl) => {
    if (redisSSl === true) {
        return new Redis({
            host: `${appConfig.redis.url}`,
            port: appConfig.redis.port,
            password: appConfig.redis.token,
            tls: {}
        })
    } else {
        return new Redis({
            host: `${appConfig.redis.url}`,
            port: appConfig.redis.port,
            password: appConfig.redis.token,
        });
    }
};

const redis = checkRedisSSL(appConfig.redis.ssl);

redis.on('ready', () => {
    logger.info('Client ready from plugin source');
});
redis.on('connect', () => {
    logger.info('Client connected from plugin source');
});

redis.on('error', (error) => {
    logger.error(`Could not connect to redis in plugin source due to [${error.message}]`);
});

const referenceGenerator = new BusinessKeyGenerator(redis);
const platformDataService = new PlatformDataService(appConfig);
const dataContextFactory = new DataContextFactory(
    platformDataService,
    processService,
    referenceGenerator,
);

module.exports = dataContextFactory;

