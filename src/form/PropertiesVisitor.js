export default class PropertiesVisitor {
    constructor(jsonPathEvaluator) {
        this.jsonPathEvaluator = jsonPathEvaluator;
    }

    visit(formComponent) {
        const dataContext = formComponent.dataContext;
        const component = formComponent.component;
        const properties = component.properties;
        if (properties && properties.length !== 0) {
            Object.keys(properties).forEach((propKey) => {
                const key = propKey;
                const value = properties[key];
                properties[key] =
                    this.jsonPathEvaluator.performJsonPathEvaluation({key, value}, dataContext);

            })

        }
    }
}
