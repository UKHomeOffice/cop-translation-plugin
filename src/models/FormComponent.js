
export default class FormComponent {
    constructor(component, dataContext) {
       this.component = component;
       this.dataContext = dataContext;
    }

    accept(visitor) {
        visitor.visit(this);
    }
}
