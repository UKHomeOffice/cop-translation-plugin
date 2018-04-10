class DataResolveContext {

    constructor(keycloakContext,
                userDetailsContext,
                environmentContext,
                processContext,
                taskContext) {
        this.keycloakContext = keycloakContext;
        this.userDetailsContext = userDetailsContext;
        this.environmentContext = environmentContext;
        this.processContext = processContext;
        this.taskContext = taskContext;
    }
}

export default DataResolveContext;