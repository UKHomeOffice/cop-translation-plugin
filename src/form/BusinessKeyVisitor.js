export default class BusinessKeyVisitor {
    visit(formComponent) {
        const component = formComponent.component;
        const dataResolveContext = formComponent.dataContext;

        if (component.key === 'businessKey') {
            if (!component.defaultValue || component.defaultValue === '') {
                component.defaultValue = dataResolveContext.processContext.businessKey;
            }
        }
    }
}
