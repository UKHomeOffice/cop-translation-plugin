import FormioUtils from "formiojs/utils";
import JsonPathEvaluator from "./JsonPathEvaluator";
import TranslationServiceError from "../TranslationServiceError";
import * as logger from "../config/winston";
import FormComponent from "../models/FormComponent";
import FormComponentVisitor from "./FormComponentVisitor";

export default class FormTranslator {

    constructor(formEngineService, dataContextFactory, dataDecryptor) {
        this.formEngineService = formEngineService;
        this.dataContextFactory = dataContextFactory;
        this.dataDecryptor = dataDecryptor;
        this.formComponentVisitor = new FormComponentVisitor(new JsonPathEvaluator(), dataDecryptor);
        this.translate = this.translate.bind(this);
    }

    async translate(formName,
                    keycloakContext,
                    {processInstanceId, taskId},
                    customDataContext) {
        const form = await this.formEngineService.getForm(formName);
        if (!form) {
            throw new TranslationServiceError(`Form ${formName} could not be found`, 404);
        }
        logger.info(`Form ${form.name} has been successfully loaded`);
        const dataContext = await this.dataContextFactory.createDataContext(keycloakContext, {
            processInstanceId,
            taskId
        }, customDataContext);
        return this.applyFormResolution(dataContext, form);
    }

    applyFormResolution(dataContext, form) {
        const components = form.components;
        const sessionKeyComponent = FormioUtils.getComponent(components, "sessionKey");
        const initializationVectorComponent = FormioUtils.getComponent(components,"initialisationVector");

        FormioUtils.eachComponent(components, (component) => {
            const formComponent = new FormComponent(component, dataContext, {sessionKeyComponent,
                initializationVectorComponent});
            formComponent.accept(this.formComponentVisitor);
        });

        this.handleNestedForms(form);
        return form;
    };

    handleNestedForms(form) {
        form.components.forEach((c) => {
            if (c.components) {
                c.components.forEach((comForm) => {
                    if (comForm.tags && comForm.tags.indexOf('disabled') >= 0) {
                        FormioUtils.eachComponent(comForm.components, (nested) => {
                            nested.disabled = true
                        })
                    }
                });
            }
        })
    };


}
