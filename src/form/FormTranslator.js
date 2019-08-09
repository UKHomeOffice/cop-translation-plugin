import FormioUtils from "formiojs/utils";
import JsonPathEvaluator from "./JsonPathEvaluator";
import TranslationServiceError from "../TranslationServiceError";
import  logger from "../config/winston";
import FormComponent from "../models/FormComponent";
import FormComponentVisitor from "./FormComponentVisitor";

export default class FormTranslator {

    constructor(formEngineService, dataContextFactory, dataDecryptor) {
        this.formEngineService = formEngineService;
        this.dataContextFactory = dataContextFactory;
        this.dataDecryptor = dataDecryptor;
        this.jsonPathEvaluator = new JsonPathEvaluator();
        this.formComponentVisitor = new FormComponentVisitor(this.jsonPathEvaluator, dataDecryptor);
        this.translate = this.translate.bind(this);
        this.submit = this.submit.bind(this);
    }

    async translate(formName,
                    keycloakContext,
                    {processInstanceId, taskId},
                    customDataContext = {}) {
        logger.info(`Loading form ${formName}`);
        const form = await this.formEngineService.getForm(formName);
        if (!form) {
            throw new TranslationServiceError(`Form ${formName} could not be found`, 404);
        }
        logger.info(`Form ${form.name} has been successfully loaded`);
        const dataContext = await this.dataContextFactory.createDataContext(keycloakContext, {
            processInstanceId,
            taskId
        }, customDataContext);
        const resolvedForm = this.applyFormResolution(dataContext, form);
        return resolvedForm;
    }

    applyFormResolution(dataContext, form) {
        const components = form.components;
        FormioUtils.eachComponent(components, (component) => {
            const formComponent = new FormComponent(component, dataContext);
            formComponent.accept(this.formComponentVisitor);
        });

        this.handleNestedForms(form);
        this.applyFormElementResolution(dataContext, form);
        return form;
    }

    applyFormElementResolution(dataContext, form) {
      if (form.title) {
        form.title = this.jsonPathEvaluator.performJsonPathEvaluation({key: "Form Title", value: form.title}, dataContext);
      }
    }


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
    }

    async submit(formId, form) {
      return this.formEngineService.submitForm(formId, form);
    }


}
