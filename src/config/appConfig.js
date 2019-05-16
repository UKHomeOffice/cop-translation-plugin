const {
    PROTOCOL,
    INT_DOMAIN,
    FORMIO_SERVER_NAME,
    OPERATIONAL_POSTGREST_NAME,
    REPORTING_SERVER_NAME,
    TRANSLATION_SERVER_NAME,
    WORKFLOW_SERVER_NAME,
} = process.env;

const appConfig = {
    services: {
        operationalData: {
            url: `${PROTOCOL}${OPERATIONAL_POSTGREST_NAME}.${INT_DOMAIN}`,
        },
        workflow: {
            url: `${PROTOCOL}${WORKFLOW_SERVER_NAME}.${INT_DOMAIN}`,
        },
        translation: {
            url: `${PROTOCOL}${TRANSLATION_SERVER_NAME}.${INT_DOMAIN}`,
        },
        form: {
            url: `${PROTOCOL}${FORMIO_SERVER_NAME}.${INT_DOMAIN}`,
        },
        report: {
            url: `${PROTOCOL}${REPORTING_SERVER_NAME}.${INT_DOMAIN}`,
        },
    },
    privateKey: {
       path: process.env.PRIVATE_KEY_PATH || '/enccerts/mobileid-key.pem'
    }
};
module.exports = appConfig;
