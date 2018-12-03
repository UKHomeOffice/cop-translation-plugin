import JsonPathEvaluator from "../form/JsonPathEvaluator";

export default class FormComponent {
    constructor(component, dataContext) {
        this.component = component;
        this.dataContext = dataContext;
        this.tags = this.component.tags;

    }

    hasSessionKeyAndInitialisationVector() {
        return this.hasSessionKey() && this.hasInitialisationVector();

    }

    hasSessionKey() {
        return this.component.properties &&
            (this.component.properties['sessionKey']
                && this.component.properties['sessionKey'] !== '');
    }

    hasInitialisationVector() {
        return this.component.properties
            &&  (this.component.properties['initialisationVector']
                && this.component.properties[''] !== '');
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
