class EnvironmentContext {

    constructor(config) {
        this.operationalDataUrl = config.services.operationalData.url;
        this.referenceData = config.services.operationalData.url;
        this.workflowUrl = config.services.workflow.url;
    }
}

export default EnvironmentContext;