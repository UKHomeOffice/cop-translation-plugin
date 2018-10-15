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
        component.data.url = performJsonPathResolution(component.key, component.data.url, dataResolveContext);
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
