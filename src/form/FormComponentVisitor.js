import ContentComponentVisitor from "./ContentComponentVisitor";
import SelectComponentVisitor from "./SelectComponentVisitor";
import CustomPropertiesVisitor from "./CustomPropertiesVisitor";
import DefaultValueComponentVisitor from "./DefaultValueComponentVisitor";
import PropertiesVisitor from "./PropertiesVisitor";
import FileStorageComponentVisitor from "./FileStorageComponentVisitor";
import FilterComponentVisitor from "./FilterComponentVisitor";
import LabelComponentVisitor from "./LabelComponentVisitor";

export default class FormComponentVisitor {
    constructor(jsonPathEvaluator, dataDecryptor) {
        this.contentComponentVisitor = new ContentComponentVisitor(jsonPathEvaluator, dataDecryptor);
        this.selectComponentVisitor = new SelectComponentVisitor(jsonPathEvaluator);
        this.customPropertiesVisitor = new CustomPropertiesVisitor(jsonPathEvaluator);
        this.defaultValueVisitor = new DefaultValueComponentVisitor(jsonPathEvaluator);
        this.propertiesVisitor = new PropertiesVisitor(jsonPathEvaluator);
        this.fileStorageComponentVisitor = new FileStorageComponentVisitor();
        this.filterComponentVisitor = new FilterComponentVisitor(jsonPathEvaluator);
        this.labelComponentVisitor = new LabelComponentVisitor(jsonPathEvaluator);
    }

    visit(formComponent) {
        const component = formComponent.component;
        formComponent.accept(this.propertiesVisitor);
        formComponent.accept(this.defaultValueVisitor);
        formComponent.accept(this.customPropertiesVisitor);
        formComponent.accept(this.filterComponentVisitor);
        formComponent.accept(this.labelComponentVisitor);
        if (component.type === 'content') {
            formComponent.accept(this.contentComponentVisitor);
        }
        if (component.storage && component.storage === 'url') {
            formComponent.accept(this.fileStorageComponentVisitor);
        }
        if (component.data && component.dataSrc) {
            formComponent.accept(this.selectComponentVisitor);
       }
    }
}
