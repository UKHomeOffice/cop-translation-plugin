export default class FilterComponentVisitor {

    constructor(jsonPathEvaluator) {
        this.jsonPathEvaluator = jsonPathEvaluator;
    }

    visit(formComponent) {
        const {component, dataContext} = formComponent;
        const key = component.key;
        if (component.filter) {
            const value = component.filter;
            component.filter = this.jsonPathEvaluator.performJsonPathEvaluation({key, value}, dataContext);
        }
    }
}
