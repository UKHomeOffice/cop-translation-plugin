export default class SelectComponentVisitor {

    constructor(jsonPathEvaluator) {
        this.jsonPathEvaluator = jsonPathEvaluator;
    }

    visit(formComponent) {
        const component = formComponent.component;
        const dataResolveContext = formComponent.dataContext;
        if (component.data && component.dataSrc === 'url') {
            const key = component.key;
            const value = component.data.url;
            component.data.url = this.jsonPathEvaluator.performJsonPathEvaluation({key, value},
                dataResolveContext);
            const bearerValue = `Bearer ${dataResolveContext.keycloakContext.accessToken}`;
            const header = component.data.headers.find(h => h.key === 'Authorization');
            if (header) {
                header.value = bearerValue;
            } else {
                component.data.headers.push({
                    "key": "Authorization",
                    "value": bearerValue
                });
            }
        }
    }
}
