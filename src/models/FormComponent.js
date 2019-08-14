export default class FormComponent {
    constructor(component, dataContext) {
        this.component = component;
        this.dataContext = dataContext;
        this.tags = this.component.tags;

    }

    isEncrypted() {
        return this.tags && this.tags.find(t => t === 'sensitive')
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
