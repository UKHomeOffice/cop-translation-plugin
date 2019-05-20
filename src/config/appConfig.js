const {
    PROTOCOL,
    INT_DOMAIN,
    PRIVATE_FORM_NAME,
    PRIVATE_POSTGREST_NAME,
    PRIVATE_REFDATA_NAME,
    PRIVATE_WORKFLOW_ENGINE_NAME,
} = process.env;

const appConfig = {
    services: {
        operationalData: {
            url: `${PROTOCOL}${PRIVATE_POSTGREST_NAME}.${INT_DOMAIN}`,
        },
        workflow: {
            url: `${PROTOCOL}${PRIVATE_WORKFLOW_ENGINE_NAME}.${INT_DOMAIN}`,
        },
        form: {
            url: `${PROTOCOL}${PRIVATE_FORM_NAME}.${INT_DOMAIN}`,
        },
        referenceData: {
            url: `${PROTOCOL}${PRIVATE_REFDATA_NAME}.${INT_DOMAIN}`,
        }
    },
    privateKey: {
       path: process.env.PRIVATE_KEY_PATH || '/enccerts/mobileid-key.pem'
    }
};
module.exports = appConfig;