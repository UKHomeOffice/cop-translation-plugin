export default class LabelComponentVisitor {

    constructor(jsonPathEvaluator) {
        this.jsonPathEvaluator = jsonPathEvaluator;
    }

    visit(formComponent) {
        const {component, dataContext} = formComponent;
        const key = component.key;
        if (component.label) {
            const value = component.label;
            component.label = this.jsonPathEvaluator.performJsonPathEvaluation({key, value}, dataContext);
        }
    }
}
