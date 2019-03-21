export default class FileStorageComponentVisitor {
    constructor() {
    }

    visit(formComponent) {
        const component = formComponent.component;
        const dataResolveContext = formComponent.dataContext;
        component.options = JSON.stringify({
            "withCredentials" : true,
            "Authorization" : `Bearer ${dataResolveContext.keycloakContext.accessToken}`
        });
    }
}
