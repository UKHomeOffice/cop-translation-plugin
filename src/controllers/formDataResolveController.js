import responseHandler from "../utilities/handlers/responseHandler";
import * as logger from 'winston';
import KeycloakContext from "../models/KeycloakContext";
import axios from 'axios';
import FormioUtils from 'formiojs/utils';
import DataResolveContext from "../models/DataResolveContext";
import JSONPath from 'jsonpath'
import EnvironmentContext from "../models/EnvironmentContext";
import ProcessContext from "../models/ProcessContext";
import TaskContext from "../models/TaskContext";
import {getProcessVariables, getTaskData, getTaskVariables} from "../services/ProcessService";
import UserDetailsContext from "../models/UserDetailsContext";
import {getUserDetails} from "../services/ReferenceService";

const regExp = new RegExp('\\{(.+?)\\}');

const processVariables = async (taskId, processInstanceId, headers) => {
    return await Promise.all([
        getTaskData(taskId, headers),
        getTaskVariables(taskId, headers),
        getProcessVariables(processInstanceId, headers)
    ]);
};

const createHeader = (keycloakContext) => {
    return {
        'Authorization': `Bearer ${keycloakContext.accessToken}`,
        'Content-Type': 'application/json',
        'Accept-Type': 'application/json'
    };
};

const getForm = async (formName) => {
    try {
        const response = await axios.get(`${process.env.FORM_URL}/form?name=${formName}`);
        return response.data ? response.data[0] : null;
    } catch (e) {
        throw e;
    }
};

const getFormSchema = (req, res) => {
    const formName = req.params.formName;
    logger.info("Getting form schema for %s", formName);

    getForm(formName).then((form) => {
        if (form) {
            const keycloakContext = new KeycloakContext(req.kauth);
            logger.debug("Form loaded...initiating processing " + JSON.stringify(form));

            const taskId = req.query.taskId;
            const processInstanceId = req.query.processInstanceId;
            const headers = createHeader(keycloakContext);

            getUserDetails(keycloakContext.email, headers).then((user) => {
                if (taskId && processInstanceId) {
                    axios.all([getTaskData(taskId, headers), getTaskVariables(taskId, headers), getProcessVariables(processInstanceId,headers)])
                        .then(axios.spread((taskData, taskVariables, processVariables) => {
                            applyContextResolution(new DataResolveContext(keycloakContext, new UserDetailsContext(user), new EnvironmentContext(process.env),
                                new ProcessContext(processVariables),
                                new TaskContext(taskData, taskVariables)), form, res);

                        })).catch((e) => {
                        logger.error("Failed to resolve process data promise %s", e);
                        responseHandler.res({
                            code: 400,
                            message: `Failed to resolve process data for form ${e}`
                        }, {}, res);
                    });
                } else {
                    applyContextResolution(new DataResolveContext(keycloakContext, new UserDetailsContext(user), new EnvironmentContext(process.env)), form, res);
                }
            });
        } else {
            responseHandler.res({code: 404, message: `Form with name '${formName}' does not exist`}, {}, res);
        }
    }).catch((error) => {
        logger.error("Error occurred while requesting form '%s'", error.message);
        const errorStatus = !error.response ? 'Error: Network Error connecting to form engine' : error.response.data.message;
        responseHandler.res({code: 500, message: errorStatus}, {}, res);
    });
};


const applyContextResolution = (dataContext, form, res) => {
    FormioUtils.eachComponent(form.components, (component) => {
        handleDefaultValueExpressions(component, dataContext);
        handleUrlComponents(component, dataContext);
    });
    responseHandler.res(null, form, res);
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
            const updatedValue =  value.replace(regExp, (match, capture) => {
                const val = JSONPath.value(dataResolveContext, capture);
                logger.info("JSON path '%s' detected for '%s' with parsed value '%s'", capture, key, val);
                return val;
            });
            return (updatedValue === 'null' || updatedValue === 'undefined') ? null : updatedValue;
        }
        return value;
    } catch (e) {
        logger.error("Error occurred while trying to resolve defaultValue %s...error message %s", value, e);
        return value;
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
