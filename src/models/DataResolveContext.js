class DataResolveContext {

    constructor(keycloakContext,
                staffDetailsDataContext,
                environmentContext,
                processContext,
                taskContext,
                customDataContext) {
        this.keycloakContext = keycloakContext;
        this.staffDetailsDataContext = staffDetailsDataContext;
        this.environmentContext = environmentContext;
        this.processContext = processContext;
        this.taskContext = taskContext;
        if (customDataContext) {
            Object.keys(customDataContext).forEach(key => {
                this[key] = customDataContext[key];
            });
        }
    }
}

export default DataResolveContext;