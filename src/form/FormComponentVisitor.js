import ContentComponentVisitor from "./ContentComponentVisitor";
import SelectComponentVisitor from "./SelectComponentVisitor";
import DefaultValueComponentVisitor from "./DefaultValueComponentVisitor";

export default class FormComponentVisitor {
    constructor(jsonPathEvaluator, dataDecryptor) {
        this.jsonPathEvaluator = jsonPathEvaluator;
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
        const component = formComponent.component;
        if (formComponent.isEncrypted()) {
            if (formComponent.hasSessionKey()) {
                const key = 'sessionKey';
                const value = component.properties[key];
                component.properties[key] =
                    this.jsonPathEvaluator.performJsonPathEvaluation({key, value}, dataContext);
            }
            if (formComponent.hasInitialisationVector()) {
                const key = 'initialisationVector';
                const value = component.properties[key];
                component.properties[key] =
                    this.jsonPathEvaluator.performJsonPathEvaluation({key, value}, dataContext);
            }
        }
    }
}
