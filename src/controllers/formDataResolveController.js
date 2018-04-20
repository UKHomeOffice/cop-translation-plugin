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
import {getForm} from "../services/FormEngineService";

const regExp = new RegExp('\\{(.+?)\\}');


const getFormSchemaForContext = (req, res) => {
    const data = req.body;
    const formName = data.formName;
    if (data.dataContext) {
        getForm(formName, res, (response, form) => {
           parseForm(req, form, response, data.dataContext)
        });
    } else {
        logger.error("No data context defined for POST");
        responseHandler.res({code: 400, message: 'No data context provided to perform data resolution'}, {}, res);
    }
};


const getFormSchema = (req, res) => {
    getForm(req.params.formName, res, (response, form) => {
        parseForm(req, form, response, null);
    });
};


const parseForm = (req, form, response, customDataContext)  => {
    const keycloakContext = new KeycloakContext(req.kauth);
    const taskId = req.query.taskId;
    const processInstanceId = req.query.processInstanceId;
    const headers = createHeader(keycloakContext);
    if (customDataContext) {
        logger.info("Custom data context [%s]", JSON.stringify(customDataContext));
    }
    getUserDetails(keycloakContext.email, headers).then((user) => {
        if (taskId && processInstanceId) {
            axios.all([getTaskData(taskId, headers), getTaskVariables(taskId, headers), getProcessVariables(processInstanceId, headers)])
                .then(axios.spread((taskData, taskVariables, processVariables) => {
                    applyContextResolution(new DataResolveContext(keycloakContext, new UserDetailsContext(user),
                        new EnvironmentContext(process.env),
                        new ProcessContext(processVariables),
                        new TaskContext(taskData, taskVariables), customDataContext), form, response);

                })).catch((e) => {
                logger.error("Failed to resolve process data promise %s", e);
                responseHandler.res({code: 400, message: `Failed to resolve process data for form ${e}`}, {}, response);
            });
        } else {
            applyContextResolution(new DataResolveContext(keycloakContext, new UserDetailsContext(user),
                new EnvironmentContext(process.env), null, null, customDataContext), form, response);
        }
    });
};
const createHeader = (keycloakContext) => {
    A
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

            String.prototype.replaceAll = function(search, replacement) {
                const target = this;
                return target.replace(new RegExp(search, 'g'), replacement);
            };
            const updatedValue = value.replaceAll(regExp, (match, capture) => {
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
    getFormSchema,
    getFormSchemaForContext
};
