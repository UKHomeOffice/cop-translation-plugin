import axios from "axios";
import responseHandler from "../utilities/handlers/responseHandler";
import * as logger from "winston/lib/winston";


const getForm = async (formName) => {
    try {
        const response = await axios.get(`${process.env.FORM_URL}/form?name=${formName}`);
        return response.data ? response.data[0] : null;
    } catch (e)  {
        logger.error(`An exception occurred while trying to get form '%s' ... '%s'`, formName, e);
        return null;
    }
};


export {
    getForm
}