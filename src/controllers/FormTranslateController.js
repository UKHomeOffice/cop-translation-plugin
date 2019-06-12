import KeycloakContext from "../models/KeycloakContext";
import TranslationServiceError from "../TranslationServiceError";
import logger from "../config/winston";

export default class FormTranslateController  {
    constructor(formTranslator) {
        this.formTranslator = formTranslator;
    }

    async getForm(req) {
        const {formName} = req.params;
        const {taskId, processInstanceId} = req.query;
        logger.info(`taskId in FormTranslateController = ${taskId}`);
        logger.info(`processInstanceId in FormTranslateController = ${processInstanceId}`);
        const form = await this.formTranslator.translate(formName,
            new KeycloakContext(req.kauth),{taskId, processInstanceId});
        if (!form) {
            throw new TranslationServiceError(`Form ${formName} could not be found`, 404);
        }
        // logger.info(`Got form ${form.name} with data...`);
        // logger.info(form);
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
