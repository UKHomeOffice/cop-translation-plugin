import responseHandler from "../utilities/handlers/responseHandler";
import * as logger from 'winston';
import KeycloakContext from "../models/KeycloakContext";
import axios from 'axios';
import FormioUtils from 'formiojs/utils';
import DataResolveContext from "../models/DataResolveContext";
import JSONPath from 'jsonpath'
import EnvironmentContext from "../models/EnvironmentContext";

const regExp = new RegExp('\\{(.+?)\\}');


const taskVariables = async (taskId) => {

};

const processInstanceVariables = async (processInstanceId) => {

};

const userDetails = async (email) => {

};

const getFormSchema = (req, res) => {

    const formName = req.params.formName;
    logger.info("Getting form schema for %s", formName);
    const dataResolveContext = new DataResolveContext(new KeycloakContext(req.kauth), null, new EnvironmentContext(process.env));

    const taskId = req.query.taskId;

    if (taskId) {
        logger.info("Task id %s ...loading process and task info", taskId);
        //load task instance variables
        //load process instance variables
        //set into data context
    }

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
            const errorStatus = !error.response ? 'Error: Network Error connecting to form engine' : error.response.data.message;
            responseHandler.res({code: 500, message: errorStatus}, {}, res);
        });
};

const handleDefaultValueExpressions = (component, dataResolveContext) => {
    if (component.defaultValue) {
        component.defaultValue = performJsonPathResolution(component.key,
            component.defaultValue, dataResolveContext);
    }
};

const performJsonPathResolution = (key, value, dataResolveContext) => {
    try {
        if (regExp.test(value)) {
            return value.replace(regExp, (match, capture) => {
                const val = JSONPath.value(dataResolveContext, capture);
                logger.info("JSON path '%s' detected for '%s' with parsed value '%s'", capture, key, val);
                return val;
            });
        }
        return value;
    } catch (e) {
        logger.error("Error occurred while trying to resolve defaultValue %s...error message %s", value, e);
    }
};

const handleUrlComponents = (component, dataResolveContext) => {
    if (component.data && component.dataSrc === 'url') {
        component.lazyLoad = true;
        component.data.url = performJsonPathResolution(component.key, component.data.url, dataResolveContext);
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
