import axios from "axios/index";
import responseHandler from "../utilities/handlers/responseHandler";
import * as logger from "winston/lib/winston";


const loadForm = async (formName) => {
    try {
        const response = await axios.get(`${process.env.FORM_URL}/form?name=${formName}`);
        return response.data ? response.data[0] : null;
    } catch (e) {
        throw e;
    }
};

const getForm = (formName, res, callback) => {
    logger.info("Getting form schema for %s", formName);
    loadForm(formName)
        .then((form) => {
            if (form) {
                callback(res,form)
            } else {
                logger.error("Form with name [%s] does not exist", formName);
                responseHandler.res({code: 404, message: `Form with name '${formName}' does not exist`}, {}, res);
            }
        }).catch((error) => handleFormLoadingError(error, res));
};

const handleFormLoadingError = (error, res) => {
    logger.error("Error occurred while requesting form '%s'", error.message);
    const errorStatus = !error.response ? 'Error: Network Error connecting to form engine' : error.response.data.message;
    responseHandler.res({code: 500, message: errorStatus}, {}, res);
};

export {
    getForm
}