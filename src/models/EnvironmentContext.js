class EnvironmentContext {

    constructor(config) {
        this.operationalDataUrl = config.services.operationalData.url;
        this.workflowUrl = config.services.workflow.url;
        this.referenceDataUrl = config.services.referenceData.url;
        this.privateUiUrl = config.services.privateUi.url;
    }
}

export default EnvironmentContext;
