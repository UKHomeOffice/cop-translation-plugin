const {
    API_FORM_URI,
    API_COP_URI,
    API_REF_URI,
    ENGINE_URI,
    WWW_URI,
    TRANSLATION_CORS_ORIGIN,
    REDIS_URI,
    REDIS_PORT,
    REDIS_TOKEN,
    TRANSLATION_KEYCLOAK_CLIENT_ID,
    KEYCLOAK_URL,
    KEYCLOAK_REALM,
    TRANSLATION_PORT,
    TRANSLATION_PRIVATE_KEY_PATH,
} = process.env;

const appConfig = {
    services: {
        operationalData: {
            url: API_COP_URI,
        },
        workflow: {
            url: ENGINE_URI,
        },
        form: {
            url: API_FORM_URI,
        },
        referenceData: {
            url: API_REF_URI,
        },
        privateUi: {
            url: WWW_URI,
        }
    },
    privateKey: {
        path:  TRANSLATION_PRIVATE_KEY_PATH || '/enccerts/mobileid-key.pem'
    },
    cors: {
        origin: TRANSLATION_CORS_ORIGIN
    },
    redis: {
        url: REDIS_URI || 'localhost',
        port: REDIS_PORT || 6379,
        token: REDIS_TOKEN,
        ssl: REDIS_SSL || false,
    },
    port: TRANSLATION_PORT || 8080,
    keycloak: {
        clientId: TRANSLATION_KEYCLOAK_CLIENT_ID,
        url: KEYCLOAK_URL,
        realm: KEYCLOAK_REALM
    }
};
module.exports = appConfig;
