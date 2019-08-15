import FormioUtils from "formiojs/utils";
import JsonPathEvaluator from "./JsonPathEvaluator";
import JSONPath from "jsonpath";
import TranslationServiceError from "../TranslationServiceError";
import logger from "../config/winston";
import FormComponent from "../models/FormComponent";
import FormSubmissionComponent from "../models/FormSubmissionComponent";
import FormComponentVisitor from "./FormComponentVisitor";
import FormSubmissionComponentVisitor from "./FormSubmissionComponentVisitor";

export default class FormTranslator {

    constructor(formEngineService, dataContextFactory, dataDecryptor, referenceGenerator) {
        this.formEngineService = formEngineService;
        this.dataContextFactory = dataContextFactory;
        this.jsonPathEvaluator = new JsonPathEvaluator();
        this.formComponentVisitor = new FormComponentVisitor(this.jsonPathEvaluator, dataDecryptor);
        this.referenceGenerator = referenceGenerator;
        this.formSubmissionComponentVisitor = new FormSubmissionComponentVisitor(dataDecryptor);
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

    async submit(formId, formData, keycloakContext) {
        const formSchema = await this.formEngineService.getFormById(formId);
        const submissionContext = await this.dataContextFactory.createSubmissionContext(formData);
        this.traverseForSubmission(formSchema.components, formData.data, submissionContext);

        return this.formEngineService.submitForm(formId, formData, keycloakContext);
    }

    traverseForSubmission(components, formData, submissionContext) {
      FormioUtils.eachComponent(components, (component, path) => {
          if (!path) {
            return;
          }
          console.log(`Visiting path '${path}'`);
          const jsonPath = `$.${path}`;
          const data = JSONPath.value(formData, jsonPath);

          if (Array.isArray(data)) {
              data.map(item => {
                this.traverseForSubmission(component.components, item);
              });
          } else {
              const setData = newValue => JSONPath.value(formData, jsonPath, newValue);
              const getData = () => JSONPath.value(formData, jsonPath);
              const formComponent = new FormSubmissionComponent(component, getData, setData, submissionContext);
              formComponent.accept(this.formSubmissionComponentVisitor);
          }
      })
    }

}
