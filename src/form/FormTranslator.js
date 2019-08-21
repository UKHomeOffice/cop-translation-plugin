import FormioUtils from "formiojs/utils";
import JsonPathEvaluator from "./JsonPathEvaluator";
import TranslationServiceError from "../TranslationServiceError";
import logger from "../config/winston";
import FormComponent from "../models/FormComponent";
import FormComponentVisitor from "./FormComponentVisitor";
import FormDataDecryptor from "./FormDataDecryptor";

export default class FormTranslator {

    constructor(formEngineService, dataContextFactory, dataDecryptor, referenceGenerator) {
        this.formEngineService = formEngineService;
        this.dataContextFactory = dataContextFactory;
        this.jsonPathEvaluator = new JsonPathEvaluator();
        this.formComponentVisitor = new FormComponentVisitor(this.jsonPathEvaluator, dataDecryptor);
        this.referenceGenerator = referenceGenerator;
        this.formDataDecryptor = new FormDataDecryptor(dataDecryptor);
    }

    async translate(formName,
                    keycloakContext,
                    {processInstanceId, taskId},
                    customDataContext = {}) {
        logger.info(`Loading form ${formName}`);
        const form = await this.formEngineService.getForm(formName, keycloakContext);
        if (!form) {
            throw new TranslationServiceError(`Form ${formName} could not be found`, 404);
        }
        logger.info(`Form ${form.name} has been successfully loaded`);
        const dataContext = await this.dataContextFactory.createDataContext(keycloakContext, {
            processInstanceId,
            taskId
        }, customDataContext);
        this.decryptDataContext(dataContext);
        const resolvedForm = this.applyFormResolution(dataContext, form);
        if (resolvedForm) {
            const components = resolvedForm.components;
            const businessKeyComponents = FormioUtils.findComponents(components, {
                'key': 'businessKey'
            });
            if (businessKeyComponents.length !== 0) {
                const businessKeyComponent = businessKeyComponents[0];
                if (businessKeyComponent.defaultValue === '') {
                    businessKeyComponent.defaultValue = await this.referenceGenerator.newBusinessKey()
                }
            }
        }
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

    decryptDataContext(dataContext) {
        if (dataContext.processContext) {
          Object.keys(dataContext.processContext).forEach(key => {
              const value = dataContext.processContext[key];
              if (value) {
                  this.formDataDecryptor.decryptFormData(value, dataContext);
              }
          });
        }
    }

    async submit(formId, formData, keycloakContext) {
        return this.translateForSubmission(formId, formData, keycloakContext, async () => this.formEngineService.submitForm(formId, formData, keycloakContext));
    }

    async translateForSubmission(formId, formData, keycloakContext, submit) {
        const formSchema = await this.formEngineService.getFormById(formId, keycloakContext);
        const submissionContext = await this.dataContextFactory.createSubmissionContext(formData);

        this.formDataDecryptor.encryptFormData(formSchema.components, formData.data, submissionContext);
        if (submissionContext.encryptionMetaData) {
            const {iv, publicKey} = submissionContext.encryptionMetaData;

            formData.data._encryptionMetaData = {
              iv: iv.toString('base64'),
              publicKey: publicKey.toString('base64'),
            }
        }

        return submit();
    }
}
