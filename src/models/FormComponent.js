export default class FormComponent {
    constructor(component, dataContext, {
        sessionKeyComponent,
        initializationVectorComponent}) {
        this.component = component;
        this.dataContext = dataContext;
        this.sessionKeyComponent = sessionKeyComponent;
        this.initializationVectorComponent = initializationVectorComponent;
    }

    hasSessionKeyAndInitialisationVector() {
        return (this.sessionKeyComponent &&  this.sessionKeyComponent.defaultValue) &&
            (this.initializationVectorComponent &&  this.initializationVectorComponent.defaultValue)

    }
    accept(visitor) {
        visitor.visit(this);
    }
}
