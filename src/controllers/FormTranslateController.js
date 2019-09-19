import KeycloakContext from "../models/KeycloakContext";
import TranslationServiceError from "../TranslationServiceError";

export default class FormTranslateController  {
    constructor(formTranslator, processService) {
        this.formTranslator = formTranslator;
        this.processService = processService;
    }

    async getForm(req) {
        const {formName} = req.params;
        const {taskId, processInstanceId} = req.query;
        const form = await this.formTranslator.translate(formName,
            new KeycloakContext(req.kauth),{taskId, processInstanceId});
        if (!form) {
            throw new TranslationServiceError(`Form ${formName} could not be found`, 404);
        }
        return form;
    }

    async submitForm(req) {
        const {formId} = req.params;
        
        const bodyData = req.body;
        const variableName = bodyData.variableName;
        const processKey = bodyData.processKey;
        const submissionData = bodyData.data;
        const isShiftApiCall = bodyData.isShiftApiCall;
        const keycloakContext = new KeycloakContext(req.kauth);
        
        const email = keycloakContext.email;
        try {
           await this.formTranslator.submit(formId, bodyData.data, keycloakContext);
        } catch (e) {
            throw new TranslationServiceError(e.message, e.status);
        }
        let response;
        if (isShiftApiCall) {
            response = await this.processService.startProcessInstance({
                data: submissionData,
                processKey: processKey,
                variableName: variableName
            }, req.headers);
        } else {
            const createVariable = () => {
                const variables = {};
                variables[variableName] = {
                  value: JSON.stringify(submissionData),
                  type: 'json',
                };
                variables.initiatedBy = {
                  value: email,
                  type: 'String',
                };
              
                variables.type = {
                  value: 'non-notifications',
                  type: 'String',
                };
                return {
                  variables,
                };
              };
              response =  await this.processService.startNonShiftProcessInstance(createVariable(), processKey, req.headers);
        }    
        if (response) {
            return response.data;
        }
        throw new TranslationServiceError('Failed to create workflow');
    }

    async getFormWithContext(req) {
        const data = req.body;
        if (data.dataContext) {
            const formName = data.formName;
            const {taskId, processInstanceId} = req.query;
            return await this.formTranslator.translate(formName,
                new KeycloakContext(req.kauth), {taskId, processInstanceId}, data.dataContext);
        } else {
            throw new TranslationServiceError('No data context provided', 400);
        }
    }
}
