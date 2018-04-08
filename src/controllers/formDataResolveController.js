import responseHandler from "../utilities/handlers/responseHandler";
import * as logger from 'winston';
import KeycloakContext from "../models/KeycloakContext";
import axios from 'axios';
import FormioUtils from 'formiojs/utils';
import DataResolveContext from "../models/DataResolveContext";
import JSONPath from 'jsonpath'

const getFormSchema = (req, res) => {

    const formName = req.params.formName;

    logger.info("Getting form schema for %s", formName);
    const keycloakContext = new KeycloakContext(req.kauth);

    const dataResolveContext = new DataResolveContext(keycloakContext, null, null);

    axios.get(`${process.env.FORM_URL}/form?name=${formName}`)
        .then((response) => {
            const form = response.data ? response.data[0] : null;
            if (form) {
                logger.info("Form loaded...initiating processing");
                FormioUtils.eachComponent(form.components, (component) => {
                    handleDefaultValueExpressions(component, dataResolveContext);
                    handleUrlComponents(component, dataResolveContext);
                });
                responseHandler.res(null, form, res);
            } else {
                responseHandler.res({code: 404, message: `Form with name '${formName}' does not exist`}, {}, res);
            }
        })
        .catch((error) => {
            logger.error("Error occurred while requesting form '%s'", error.message);
            let errorStatus;
            if (!error.response) {
                errorStatus = 'Error: Network Error connecting to form engine';
            } else {
                errorStatus = error.response.data.message;
            }
            responseHandler.res({code: 500, message: errorStatus}, {}, res);
        });
};

const handleDefaultValueExpressions = (component, dataResolveContext) => {
    if (component.defaultValue && component.defaultValue.startsWith("$.")) {
        logger.info("JSON path %s detected for %s", component.defaultValue, component.key);
        const pathExpression = component.defaultValue;
        try {
            component.defaultValue = JSONPath.query(dataResolveContext, pathExpression);
        } catch (e) {
            logger.error("Error occurred while trying to resolve defaultValue %s...error message",
                component.defaultValue, e);
        }
    }
};

const handleUrlComponents = (component, dataResolveContext) => {

};


export default {
    getFormSchema
};
