import responseHandler from "../utilities/handlers/responseHandler";
import * as logger from 'winston';
import KeycloakContext from "../models/KeycloakContext";
import axios from 'axios';
import FormioUtils from 'formiojs/utils';
import DataResolveContext from "../models/DataResolveContext";
import JSONPath from 'jsonpath'
import EnvironmentContext from "../models/EnvironmentContext";

const regExp = new RegExp('\\{(.+?)\\}');


const getFormSchema = (req, res) => {

    const formName = req.params.formName;

    logger.info("Getting form schema for %s", formName);
    const keycloakContext = new KeycloakContext(req.kauth);

    const dataResolveContext = new DataResolveContext(keycloakContext, null, new EnvironmentContext(process.env));

    axios.get(`${process.env.FORM_URL}/form?name=${formName}`)
        .then((response) => {
            const form = response.data ? response.data[0] : null;
            if (form) {
                logger.debug("Form loaded...initiating processing " + JSON.stringify(form));
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
    if (component.defaultValue) {
        try {
            if (regExp.test(component.defaultValue)) {
                component.defaultValue = component.defaultValue.replace(regExp,  (match, capture) => {
                    const val =  JSONPath.value(dataResolveContext, capture);
                    logger.info("JSON path '%s' detected for '%s' with parsed value '%s'", capture, component.key, val);
                    return val;
                });
               }
        } catch (e) {
            logger.error("Error occurred while trying to resolve defaultValue %s...error message %s", component.defaultValue, e);
        }
    }
};

const handleUrlComponents = (component, dataResolveContext) => {
    if (component.data && component.dataSrc === 'url') {
        const url = component.data.url;
        component.lazyLoad = true;
        if (regExp.test(url)) {
            try {
                component.data.url = url.replace(regExp, (match, capture) => {
                    const val = JSONPath.value(dataResolveContext, capture);
                    logger.info("JSON path '%s' detected for '%s' with parsed value '%s'", capture, component.key, val);
                    return val;
                });
            } catch (e) {
                logger.error("Error occurred while trying to resolve url %s...error message %s", url, e);
            }

        }
        const bearerValue = `Bearer ${dataResolveContext.keycloakContext.accessToken}`;
        const header = component.data.headers.find(h => h.key === 'Authorization');
        if (header) {
            header.value = bearerValue;
        } else {
            component.data.headers.push({
                "key": "Authorization",
                "value": bearerValue
            });
        }
    }
};


export default {
    getFormSchema
};
