class EnvironmentContext {

    constructor(env) {
        this.referenceDataUrl = env.REFERENCE_DATA_URL;
        this.workflowUrl = env.WORKFLOW_URL;
    }
}

export default EnvironmentContext;