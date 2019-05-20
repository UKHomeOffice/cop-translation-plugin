class EnvironmentContext {

    constructor(config) {
        this.operationalDataUrl = config.services.operationalData.url;
        this.workflowUrl = config.services.workflow.url;
        this.referenceDataUrl = config.services.referenceData.url;
    }
}

export default EnvironmentContext;