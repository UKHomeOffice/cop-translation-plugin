class DataResolveContext {

    constructor(keycloakContext, userDetailsContext, environmentContext) {
        this.keycloakContext = keycloakContext;
        this.userDetailsContext = userDetailsContext;
        this.environmentContext = environmentContext;
    }
}

export default DataResolveContext;