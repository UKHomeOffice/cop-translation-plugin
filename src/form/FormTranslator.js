import FormioUtils from "formiojs/utils";
import JsonPathEvaluator from "./JsonPathEvaluator";
import TranslationServiceError from "../TranslationServiceError";
import logger from "../config/winston";
import FormComponent from "../models/FormComponent";
import FormComponentVisitor from "./FormComponentVisitor";
import validator from 'validator';

export default class FormTranslator {

    constructor(formEngineService, dataContextFactory) {
        this.formEngineService = formEngineService;
        this.dataContextFactory = dataContextFactory;
        this.jsonPathEvaluator = new JsonPathEvaluator();
        this.formComponentVisitor = new FormComponentVisitor(this.jsonPathEvaluator);
    }

    async translate(id,
                    keycloakContext,
                    {processInstanceId, taskId, live},
                    customDataContext = {}) {
        logger.info(`Loading form ${id}`);
        let form;
        if ((live && live === '1') && validator.isUUID(id)) {
            logger.info('Form requested with id and live = 1');
            form = await this.formEngineService.getFormById(id, keycloakContext);
        } else {
            form = await this.formEngineService.getForm(id, keycloakContext);
        }
        if (!form) {
            throw new TranslationServiceError(`Form ${id} could not be found`, 404);
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
            form.title = this.jsonPathEvaluator.performJsonPathEvaluation({
                key: "Form Title",
                value: form.title
            }, dataContext);
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

    async submit(formId, formData, keycloakContext) {
        return this.formEngineService.submitForm(formId, formData, keycloakContext);
    }

    async translateForSubmission(formId, formData, keycloakContext, submit) {
        const formSchema = await this.formEngineService.getFormById(formId, keycloakContext);
        const submissionContext = await this.dataContextFactory.createSubmissionContext(formData);
        if (!submissionContext.businessKey) {
            logger.warn(`Not encrypting data for form ${formSchema.name} as there is no business key field on the form`);
            return submit();
        }

        return submit();
    }
}
