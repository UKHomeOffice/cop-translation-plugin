import responseHandler from "../utilities/handlers/responseHandler";
import * as logger from 'winston';
import KeycloakContext from "../models/KeycloakContext";
import FormioUtils from 'formiojs/utils';
import DataResolveContext from "../models/DataResolveContext";
import JSONPath from 'jsonpath'
import EnvironmentContext from "../models/EnvironmentContext";
import ProcessContext from "../models/ProcessContext";
import TaskContext from "../models/TaskContext";
import {getProcessVariables, getTaskData, getTaskVariables} from "../services/ProcessService";
import StaffDetailsContext from "../models/StaffDetailsContext";
import {getShiftDetails, getStaffDetails} from "../services/PlatformDataService";
import {getForm} from "../services/FormEngineService";
import ShiftDetailsContext from "../models/ShiftDetailsContext";

const regExp = new RegExp('\\{(.+?)\\}');


const getFormSchemaForContext = async (req, res) => {
    const data = req.body;
    const formName = data.formName;
    const {taskId, processInstanceId} = req.query;
    const kauth = req.kauth;
    if (data.dataContext) {
        const form = await dataResolvedForm({formName, taskId, processInstanceId, kauth}, data.dataContext);
        responseHandler.res(null, {formName, form}, res);
    } else {
        logger.error("No data context defined for POST");
        responseHandler.res({code: 400, message: 'No data context provided to perform data resolution'}, {formName}, res);
    }
};


const dataResolvedForm = async ({formName, processInstanceId, taskId, kauth}, customDataContext) => {
    const form = await getForm(formName);
    if (!form) {
        return null;
    }
    const keycloakContext = new KeycloakContext(kauth);
    const headers = createHeader(keycloakContext);

    const email = keycloakContext.email;
    const staffDetails = await getStaffDetails(email);
    const shiftDetails = await getShiftDetails(email);
    const staffDetailsContext = new StaffDetailsContext(staffDetails);
    const environmentContext = new EnvironmentContext(process.env);
    const shiftDetailsContext = new ShiftDetailsContext(shiftDetails);
    let contextData;
    if (taskId && processInstanceId) {
        const taskData = await getTaskData(taskId, headers);
        const processData = await getProcessVariables(processInstanceId, headers);
        const taskVariables  =  await getTaskVariables(taskId, headers);
        contextData = new DataResolveContext(keycloakContext, staffDetailsContext,
            environmentContext,
            new ProcessContext(processData),
            new TaskContext(taskData, taskVariables), customDataContext, shiftDetailsContext);

    } else {
        contextData = new DataResolveContext(keycloakContext,
            staffDetailsContext, environmentContext, null, null,
            customDataContext, shiftDetailsContext);
    }
    return applyFormResolution(contextData, form);
};

const getFormSchema = async (req, res) => {
    const {formName} = req.params;
    const {taskId, processInstanceId} = req.query;
    const kauth = req.kauth;
    const form = await dataResolvedForm({formName, taskId, processInstanceId, kauth}, null);
    responseHandler.res(null, {formName, form}, res)
};

const createHeader = (keycloakContext) => {
    return {
        'Authorization': `Bearer ${keycloakContext.accessToken}`,
        'Content-Type': 'application/json',
        'Accept-Type': 'application/json'
    };
};


const applyFormResolution = (dataContext, form) => {
    FormioUtils.eachComponent(form.components, (component) => {
        handleDefaultValueExpressions(component, dataContext);
        handleUrlComponents(component, dataContext);
    });

    return form;
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

            String.prototype.replaceAll = function (search, replacement) {
                const target = this;
                return target.replace(new RegExp(search, 'g'), replacement);
            };
            const updatedValue = value.replaceAll(regExp, (match, capture) => {
                const val = JSONPath.value(dataResolveContext, capture);
                logger.info("JSON path '%s' detected for '%s' with parsed value '%s'", capture, key, (val ? val : "no match"));
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
        if (component.data.tags && !component.data.tags.contains('platform-read-data')) {
            if (header) {
                header.value = bearerValue;
            } else {
                component.data.headers.push({
                    "key": "Authorization",
                    "value": bearerValue
                });
            }
        }
    }
};


export default {
    getFormSchema,
    getFormSchemaForContext
};
