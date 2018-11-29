export default class FormComponent {
    constructor(component, dataContext, {
        sessionKeyComponent,
        initializationVectorComponent}) {
        this.component = component;
        this.dataContext = dataContext;
        this.sessionKeyComponent = sessionKeyComponent;
        this.initializationVectorComponent = initializationVectorComponent;
        this.tags = this.component.tags;
    }

    hasSessionKeyAndInitialisationVector() {
        return (this.sessionKeyComponent &&  this.sessionKeyComponent.defaultValue) &&
            (this.initializationVectorComponent &&  this.initializationVectorComponent.defaultValue)

    }

    isEncrypted() {
        return this.tags && this.tags.find(t => t === 'encrypted')
    }

    isImage() {
        return this.tags && this.tags.find(t => t === 'image')
    }

    imageType() {
        return this.component.properties ?
            (this.component.properties['imageType'] ? this.component.properties['imageType'] : 'png') : 'png';
    }

    accept(visitor) {
        visitor.visit(this);
    }


}
