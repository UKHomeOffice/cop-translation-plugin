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
import {getLocation, getLocationType, getShiftDetails, getStaffDetails} from "../services/PlatformDataService";
import {getForm} from "../services/FormEngineService";
import ShiftDetailsContext from "../models/ShiftDetailsContext";
import moment from "moment";

const regExp = new RegExp('\\{(.+?)\\}');

const createHeader = (keycloakContext) => {
    return {
        'Authorization': `Bearer ${keycloakContext.accessToken}`,
        'Content-Type': 'application/json',
        'Accept-Type': 'application/json'
    };
};


const performJsonPathResolution = (key, value, dataResolveContext, isImage) => {
    try {
        if (regExp.test(value)) {
            String.prototype.replaceAll = function (search, replacement) {
                const target = this;
                return target.replace(new RegExp(search, 'g'), replacement);
            };
            const updatedValue = value.replaceAll(regExp, (match, capture) => {
                let val = JSONPath.value(dataResolveContext, capture);
                if (isImage) {
                    const defaultImg = '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';
                    val = val ? `data:image/png;base64,${val}` : `data:image/png;base64,${defaultImg}`;
                }
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

const performJsonPathResolutionOnComponent = (component, dataResolveContext) => {
    const key = component.key;
    const value = component.defaultValue;
    try {
        if (regExp.test(value)) {
            String.prototype.replaceAll = function (search, replacement) {
                const target = this;
                return target.replace(new RegExp(search, 'g'), replacement);
            };
            const updatedValue = value.replaceAll(regExp, (match, capture) => {
                let val = JSONPath.value(dataResolveContext, capture);
                if (component.properties && component.properties['date-format']) {
                    const format = component.properties['date-format'];
                    logger.info(format);
                    val = moment(val).format(format);
                    logger.info(`Date format property detected....${val}`);
                }
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
        component.data.url = performJsonPathResolution(component.key, component.data.url, dataResolveContext, false);
        handleDefaultValueExpressions(component, dataResolveContext);
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

const handleNestedForms = (form) => {
    form.components.forEach((c) => {
        if (c.components) {
            c.components.forEach((comForm) => {
                if (comForm.tags && comForm.tags.indexOf('disabled') >= 0) {
                    FormioUtils.eachComponent(comForm.components, (nested) => {
                        nested.disabled = true
                    })
                }
            });
        }
    })
};

const handleDefaultValueExpressions = (component, dataResolveContext) => {
    if (component.defaultValue) {
        component.defaultValue = performJsonPathResolutionOnComponent(component, dataResolveContext);
    }
    if (component.key === 'content' && component.type === 'content') {
        if (component.tags && component.tags.find( t => t === 'image')) {
            component.html = performJsonPathResolution(component.key, component.html, dataResolveContext, true);
        }
    }
};


const applyFormResolution = (dataContext, form) => {
    FormioUtils.eachComponent(form.components, (component) => {
        handleDefaultValueExpressions(component, dataContext);
        handleUrlComponents(component, dataContext);
    });

    handleNestedForms(form);
    return form;
};


const dataResolvedForm = async ({formName, processInstanceId, taskId, kauth}, customDataContext) => {
    const form = await getForm(formName);
    if (!form) {
        return null;
    }
    const keycloakContext = new KeycloakContext(kauth);
    const headers = createHeader(keycloakContext);

    const email = keycloakContext.email;
    const staffDetails = await getStaffDetails(email, headers);
    const shiftDetails = await getShiftDetails(email, headers);

    const staffDetailsContext = new StaffDetailsContext(staffDetails);
    const environmentContext = new EnvironmentContext(process.env);
    let shiftDetailsContext = null;

    if (shiftDetails) {
        const location = await getLocation(shiftDetails.currentlocationid, headers);
        let locationType = null;
        if (location.bflocationtypeid !== null) {
            locationType = await getLocationType(location.bflocationtypeid, headers);
        }
        shiftDetailsContext = new ShiftDetailsContext(shiftDetails, location, locationType);
    }

    let contextData;
    if (taskId && processInstanceId) {
        const taskData = await getTaskData(taskId, headers);
        const processData = await getProcessVariables(processInstanceId, headers);
        const taskVariables = await getTaskVariables(taskId, headers);
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
        responseHandler.res({
            code: 400,
            message: 'No data context provided to perform data resolution'
        }, {formName}, res);
    }
};


export default {
    getFormSchema,
    getFormSchemaForContext
};
