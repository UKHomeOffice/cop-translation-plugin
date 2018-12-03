import axios from "axios";
import * as logger from "../config/winston";
import FormioUtils from 'formiojs/utils';
import TranslationServiceError from "../TranslationServiceError";



export default class FormEngineService {

    constructor() {
       this.getForm = this.getForm.bind(this);
    }

    async getForm (formName) {
        try {
            const response = await axios.get(`${process.env.FORM_URL}/form?name=${formName}`);
            if (response && response.data) {
                const form = response.data[0];
                if (form) {
                    logger.info(`Form  ${form.name} found`);
                    const subFormComponents = FormioUtils.findComponents(form.components, {
                        type: 'form'
                    });
                    if (subFormComponents && subFormComponents.length >= 1) {
                        logger.info(`Found sub form inside ${formName}...initiating a full form load...`);
                        const fullForm = await axios.get(`${process.env.FORM_URL}/form/${form._id}?full=true`);
                        return fullForm.data;
                    }
                    logger.info(`No sub forms detected for ${formName}`);
                    return form;
                } else {
                    return null;
                }
            } else {
                return null;
            }

        } catch (e) {
            const errorMessage = `An exception occurred while trying to get form ${formName} ... '${e}'`;
            logger.error(errorMessage);
            throw new TranslationServiceError(errorMessage, 500);
        }
    };
}
