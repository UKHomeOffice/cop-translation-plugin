import responseHandler from "../utilities/handlers/responseHandler";
import * as logger from 'winston';
import KeycloakContext from "../models/KeycloakContext";

const getFormSchema = (req, res) => {
    logger.info("Getting form schema for %s", req.params.formName);
    const keycloakContext = new KeycloakContext(req.kauth);
    const data = {};
    responseHandler.res(null, data, res);
};


export default {
    getFormSchema
};
