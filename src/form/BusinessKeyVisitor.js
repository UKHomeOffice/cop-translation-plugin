export default class BusinessKeyVisitor {
    visit(formComponent) {
        const component = formComponent.component;
        const dataResolveContext = formComponent.dataContext;

        if (component.key === 'businessKey' && component.defaultValue === '') {
            component.defaultValue = dataResolveContext.processContext.businessKey;
        }
    }
}
