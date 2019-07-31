export default class RadioComponentVisitor {

    constructor(jsonPathEvaluator) {
        this.jsonPathEvaluator = jsonPathEvaluator;
    }

    visit(formComponent) {
        const component = formComponent.component;
        const dataResolveContext = formComponent.dataContext;

        if (component.values) {
          component.values.forEach(value => {
            if (value.label) {
              value.label = this.jsonPathEvaluator.performJsonPathEvaluation({key: component.key, value: value.label}, dataResolveContext);
            }
          });
        }
    }
}
