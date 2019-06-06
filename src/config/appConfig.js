const {
    PROTOCOL,
    INT_DOMAIN,
    PRIVATE_FORM_NAME,
    PRIVATE_POSTGREST_NAME,
    PRIVATE_REFDATA_URL,
    PRIVATE_WORKFLOW_ENGINE_NAME,
    PRIVATE_UI_NAME,
    EXT_DOMAIN,
    CORS_ORIGIN
} = process.env;

const appConfig = {
    services: {
        operationalDataInternal: {
            url: `${PROTOCOL}${PRIVATE_POSTGREST_NAME}.${INT_DOMAIN}`,
        },
        operationalDataExternal: {
            url: `${PROTOCOL}${PRIVATE_POSTGREST_NAME}.${EXT_DOMAIN}`,
        },
        workflow: {
            url: `${PROTOCOL}${PRIVATE_WORKFLOW_ENGINE_NAME}.${INT_DOMAIN}`,
        },
        form: {
            url: `${PROTOCOL}${PRIVATE_FORM_NAME}.${INT_DOMAIN}`,
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