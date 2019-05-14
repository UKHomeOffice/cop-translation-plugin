class EnvironmentContext {

    constructor(env) {
        this.operationalDataUrl = env.PLATFORM_DATA_URL;
        this.referenceData = env.PLATFORM_DATA_URL;
        this.workflowUrl = env.WORKFLOW_URL;
    }
}

export default EnvironmentContext;