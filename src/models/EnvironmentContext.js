class EnvironmentContext {

    constructor(env) {
        this.referenceDataUrl = env.REFERENCE_DATA_URL;
        this.workflowUrl = env.WORKFLOW_URL;
        this.prestDbName = env.PRES_DB_NAME;
    }
}

export default EnvironmentContext;