export default class FileStorageComponentVisitor {
    constructor() {
    }

    visit(formComponent) {
        const component = formComponent.component;
        const dataResolveContext = formComponent.dataContext;
        component.options = {
            "Authorization" : `Bearer ${dataResolveContext.keycloakContext.accessToken}`
        }
    }
}
