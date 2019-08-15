export default class FormSubmissionComponent {
    constructor(component, getData, setData) {
        this.component = component;
        this.tags = this.component.tags;
        this.getData = getData;
        this.setData = setData;
    }

    isEncrypted() {
        return this.tags && this.tags.find(t => t === 'sensitive')
    }

    accept(visitor) {
        visitor.visit(this);
    }
}
