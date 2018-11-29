import ContentComponentVisitor from "./ContentComponentVisitor";
import SelectComponentVisitor from "./SelectComponentVisitor";
import DefaultValueComponentVisitor from "./DefaultValueComponentVisitor";
import FormComponent from "../models/FormComponent";

export default class FormComponentVisitor {
    constructor(jsonPathEvaluator, dataDecryptor) {
        this.contentComponentVisitor = new ContentComponentVisitor(jsonPathEvaluator, dataDecryptor);
        this.selectComponentVisitor = new SelectComponentVisitor(jsonPathEvaluator);
        this.defaultValueVisitor = new DefaultValueComponentVisitor(jsonPathEvaluator);
    }

    visit(formComponent) {
        const component = formComponent.component;
        this.processDecryptionComponents(formComponent);
        this.defaultValueVisitor.visit(formComponent);
        if (component.type === 'content') {
            this.contentComponentVisitor.visit(formComponent);
        }
        if (component.data && component.dataSrc === 'url') {
            this.selectComponentVisitor.visit(formComponent);
        }
    }

    processDecryptionComponents(formComponent) {
        const dataContext = formComponent.dataContext;
        if (formComponent.sessionKeyComponent) {
            this.defaultValueVisitor.visit(new FormComponent(formComponent.sessionKeyComponent, dataContext, {}));
        }
        if (formComponent.initializationVectorComponent) {
            this.defaultValueVisitor.visit(new FormComponent(formComponent.initializationVectorComponent, dataContext, {}));
        }
    }
}
