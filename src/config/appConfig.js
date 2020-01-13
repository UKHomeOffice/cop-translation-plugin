const {
    API_COP_URI,
    API_REF_URI,
    ENGINE_URI,
    WWW_URI,
    REDIS_URI,
    REDIS_PORT,
    REDIS_TOKEN,
    REDIS_SSL
} = process.env;

const appConfig = {
    services: {
        operationalData: {
            url: API_COP_URI,
        },
        workflow: {
            url: ENGINE_URI,
        },
        referenceData: {
            url: API_REF_URI,
        },
        privateUi: {
            url: WWW_URI,
        }
    },
    redis: {
        url: REDIS_URI || 'localhost',
        port: REDIS_PORT || 6379,
        token: REDIS_TOKEN,
        ssl: REDIS_SSL || false,
    },
};
module.exports = appConfig;
