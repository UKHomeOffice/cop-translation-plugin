import ContentComponentVisitor from "./ContentComponentVisitor";
import SelectComponentVisitor from "./SelectComponentVisitor";
import DefaultValueComponentVisitor from "./DefaultValueComponentVisitor";

export default class FormComponentVisitor {
    constructor(jsonPathEvaluator, dataDecryptor) {
        this.contentComponentVisitor = new ContentComponentVisitor(jsonPathEvaluator, dataDecryptor);
        this.selectComponentVisitor = new SelectComponentVisitor(jsonPathEvaluator);
        this.defaultValueVisitor = new DefaultValueComponentVisitor(jsonPathEvaluator);
    }

    visit(formComponent) {
        const component = formComponent.component;
        this.defaultValueVisitor.visit(formComponent);
        if (component.type === 'content') {
            this.contentComponentVisitor.visit(formComponent);
        }
        if (component.data && component.dataSrc === 'url') {
            this.selectComponentVisitor.visit(formComponent);
        }
    }

}
