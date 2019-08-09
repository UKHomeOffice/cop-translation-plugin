import KeycloakContext from "../models/KeycloakContext";
import TranslationServiceError from "../TranslationServiceError";

export default class FormTranslateController  {
    constructor(formTranslator) {
        this.formTranslator = formTranslator;
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
        const form = await this.formTranslator.submit(formId, req.body);
        if (!form) {
            throw new TranslationServiceError(`Form ${formId} could not be submitted`, 500);
        }
        return form;
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
