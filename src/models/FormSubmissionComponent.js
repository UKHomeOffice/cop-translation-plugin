export default class FormSubmissionComponent {
    constructor(component, getData, setData, submissionContext) {
        this.component = component;
        this.tags = this.component.tags;
        this.getData = getData;
        this.setData = setData;
        this.submissionContext = submissionContext;
    }

    isEncrypted() {
        return this.tags && this.tags.find(t => t === 'sensitive')
    }

    accept(visitor) {
        visitor.visit(this);
    }

    businessKey() {
        return this.submissionContext.businessKey;
    }
}
