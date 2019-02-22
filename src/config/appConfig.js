const appConfig = {
    services : {
        platformData : {
            url: process.env.PLATFORM_DATA_URL
        },
        workflow: {
            url: process.env.WORKFLOW_URL
        },
        formio: {
            url: process.env.FORM_URL
        }
    },
    privateKey: {
       path: process.env.PRIVATE_KEY_PATH || '/enccerts/mobileid-key.pem'
    }
};
module.exports = appConfig;
