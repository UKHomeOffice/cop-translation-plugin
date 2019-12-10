export default class BusinessKeyVisitor {
    constructor(businessKeyGenerator) {
        this.businessKeyGenerator = businessKeyGenerator;
    }

    async visit(formComponent) {
        const component = formComponent.component;
        if (component.key === 'businessKey') {
            if (!component.defaultValue || component.defaultValue === '') {
                component.defaultValue = await this.businessKeyGenerator.newBusinessKey();
            }
        }
    }
}
