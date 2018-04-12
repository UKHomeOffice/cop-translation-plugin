class DataResolveContext {

    constructor(keycloakContext,
                userDetailsContext,
                environmentContext,
                processContext,
                taskContext,
                customDataContext) {
        this.keycloakContext = keycloakContext;
        this.userDetailsContext = userDetailsContext;
        this.environmentContext = environmentContext;
        this.processContext = processContext;
        this.taskContext = taskContext;
        if (customDataContext) {
            Object.keys(customDataContext).forEach(key => {
                console.log('key = ' + key + " value " + customDataContext[key]);
                this[key] = customDataContext[key];
            });
        }
    }
}

export default DataResolveContext;