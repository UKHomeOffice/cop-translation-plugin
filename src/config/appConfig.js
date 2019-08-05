const {
    PROTOCOL,
    PRIVATE_FORM_NAME,
    PRIVATE_OPERATIONAL_DATA_URL,
    PRIVATE_REFDATA_URL,
    PRIVATE_WORKFLOW_ENGINE_NAME,
    PRIVATE_UI_NAME,
    EXT_DOMAIN,
    CORS_ORIGIN
} = process.env;

const appConfig = {
    services: {
        operationalData: {
            url: `${PRIVATE_OPERATIONAL_DATA_URL}`,
        },
        workflow: {
            url: `${PROTOCOL}${PRIVATE_WORKFLOW_ENGINE_NAME}.${EXT_DOMAIN}`,
        },
        form: {
            url: `${PROTOCOL}${PRIVATE_FORM_NAME}.${EXT_DOMAIN}`,
        },
        referenceData: {
            url: `${PRIVATE_REFDATA_URL}`,
        },
        privateUi: {
            url: `${PROTOCOL}${PRIVATE_UI_NAME}.${EXT_DOMAIN}`,
        }
    },
    privateKey: {
       path: process.env.PRIVATE_KEY_PATH || '/enccerts/mobileid-key.pem'
    },
    cors: {
        origin: CORS_ORIGIN
    }
};
module.exports = appConfig;
