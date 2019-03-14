import ContentComponentVisitor from "./ContentComponentVisitor";
import SelectComponentVisitor from "./SelectComponentVisitor";
import DefaultValueComponentVisitor from "./DefaultValueComponentVisitor";
import PropertiesVisitor from "./PropertiesVisitor";

export default class FormComponentVisitor {
    constructor(jsonPathEvaluator, dataDecryptor) {
        this.contentComponentVisitor = new ContentComponentVisitor(jsonPathEvaluator, dataDecryptor);
        this.selectComponentVisitor = new SelectComponentVisitor(jsonPathEvaluator);
        this.defaultValueVisitor = new DefaultValueComponentVisitor(jsonPathEvaluator);
        this.propertiesVisitor = new PropertiesVisitor(jsonPathEvaluator);
    }

    visit(formComponent) {
        const component = formComponent.component;
        formComponent.accept(this.propertiesVisitor);
        formComponent.accept(this.defaultValueVisitor);
        if (component.type === 'content') {
            formComponent.accept(this.contentComponentVisitor);
        }
        if (component.data && component.dataSrc) {
            formComponent.accept(this.selectComponentVisitor);


       }
    }

}
