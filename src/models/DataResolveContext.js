
class DataResolveContext {

    constructor(keycloakContext, userContext, environmentContext) {
        this.keycloakContext = keycloakContext;
        this.userContext = userContext;
        this.environmentContext = environmentContext;
    }
}

export default DataResolveContext;