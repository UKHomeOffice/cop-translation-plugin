import KeycloakContext from "../models/KeycloakContext";
import TranslationServiceError from "../TranslationServiceError";

export default class FormTranslateController {
    constructor(formTranslator) {
        this.formTranslator = formTranslator;
    }

    async getForm(req) {
        const {id} = req.params;
        const {taskId, processInstanceId, live} = req.query;
        const form = await this.formTranslator.translate(id,
            new KeycloakContext(req.kauth), {taskId, processInstanceId, live});
        if (!form) {
            throw new TranslationServiceError(`Form ${id} could not be found`, 404);
        }
        return form;
    }

    async submitForm(req) {
        const {formId} = req.params;
        const form = await this.formTranslator.submit(formId, req.body, new KeycloakContext(req.kauth));
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
