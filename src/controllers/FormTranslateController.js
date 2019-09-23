import KeycloakContext from "../models/KeycloakContext";
import TranslationServiceError from "../TranslationServiceError";
import logger from "../config/winston";

export default class FormTranslateController {
    constructor(formTranslator, processService) {
        this.formTranslator = formTranslator;
        this.processService = processService;
    }

    async getForm(req) {
        const {formName} = req.params;
        const {taskId, processInstanceId} = req.query;
        const form = await this.formTranslator.translate(formName,
            new KeycloakContext(req.kauth), {taskId, processInstanceId});
        if (!form) {
            throw new TranslationServiceError(`Form ${formName} could not be found`, 404);
        }
        return form;
    }


    async submitShiftForm(req) {
        const shiftData = req.body;
        const {formId} = req.params;
        const keycloakContext = new KeycloakContext(req.kauth);

        const email = keycloakContext.email;
        try {
            logger.info(`Validating shift data for ${email}`);
            await this.formTranslator.submit(formId, shiftData, keycloakContext);
            logger.info("Validated shift data");
        } catch (e) {
            throw new TranslationServiceError(e.message, e.status);
        }

        const response = await this.processService.startShift(
            shiftData, req.headers
        );
        if (!response) {
            throw new TranslationServiceError('Failed to create start shift');
        }
        return response;
    }

    async submitForm(req) {
        const {formId} = req.params;

        const bodyData = req.body;

        const variableName = bodyData.variableName;
        const processKey = bodyData.processKey;
        const submissionData = bodyData.data;
        const nonShiftApiCall = bodyData.nonShiftApiCall;
        const keycloakContext = new KeycloakContext(req.kauth);

        const email = keycloakContext.email;
        try {
            await this.formTranslator.submit(formId, bodyData.data, keycloakContext);
            logger.info("Validated form submission");
        } catch (e) {
            throw new TranslationServiceError(e.message, e.status);
        }
        let response;
        if (!nonShiftApiCall) {
            logger.info(`Starting workflow ${processKey}`);
            response = await this.processService.startProcessInstance({
                data: submissionData,
                processKey: processKey,
                variableName: variableName
            }, req.headers);
        } else {
            const processData = {};
            processData[variableName] = {
                value: JSON.stringify(submissionData),
                type: 'json',
            };
            processData.initiatedBy = {
                value: email,
                type: 'String',
            };

            processData.type = {
                value: 'non-notifications',
                type: 'String',
            };
            response = await this.processService.startNonShiftProcessInstance(processData, processKey, req.headers);
        }
        if (response) {
            return response;
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
