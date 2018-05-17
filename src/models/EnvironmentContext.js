class EnvironmentContext {

    constructor(env) {
        this.platformDataUrl = env.PLATFORM_DATA_URL;
        this.workflowUrl = env.WORKFLOW_URL;
    }
}

export default EnvironmentContext;