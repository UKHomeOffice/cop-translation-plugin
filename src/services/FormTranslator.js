import {getLocation, getLocationType, getShiftDetails, getStaffDetails} from "./PlatformDataService";
import StaffDetailsContext from "../models/StaffDetailsContext";
import EnvironmentContext from "../models/EnvironmentContext";
import ShiftDetailsContext from "../models/ShiftDetailsContext";
import {getProcessVariables, getTaskData, getTaskVariables} from "./ProcessService";
import DataResolveContext from "../models/DataResolveContext";
import ProcessContext from "../models/ProcessContext";
import TaskContext from "../models/TaskContext";
import {getForm} from "./FormEngineService";
import FormioUtils from "formiojs/utils";
import JsonPathEvaluator from "./JsonPathEvaluator";
import TranslationServiceError from "../TranslationServiceError";

export default class FormTranslator {

    constructor(formEngineService, platformDataService, processService) {
        this.formEngineService = formEngineService;
        this.platformDataService = platformDataService;
        this.processService = processService;
        this.jsonPathEvaluator = new JsonPathEvaluator();
        this.translate = this.translate.bind(this);
    }

    async translate(formName,
                    keycloakContext,
                    {processInstanceId, taskId},
                    customDataContext) {
        const form = await this.formEngineService.getForm(formName);
        if (!form) {
            throw new TranslationServiceError(`Form ${formName} could not be found`, 404);
        }
        const dataContext = await this.createDataContext(keycloakContext, {
            processInstanceId,
            taskId
        }, customDataContext);
        return this.applyFormResolution(dataContext, form);
    }

    applyFormResolution(dataContext, form) {
        FormioUtils.eachComponent(form.components, (component) => {
            this.handleDefaultValueExpressions(component, dataContext);
            this.handleUrlComponents(component, dataContext);
        });

        this.handleNestedForms(form);
        return form;
    };

    handleUrlComponents (component, dataResolveContext)  {
        if (component.data && component.dataSrc === 'url') {
            component.data.url = this.jsonPathEvaluator.performJsonPathResolution(component.key, component.data.url,
                dataResolveContext, false);
            this.handleDefaultValueExpressions(component, dataResolveContext);
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

    handleNestedForms (form) {
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

    handleDefaultValueExpressions(component, dataResolveContext) {
        if (component.defaultValue) {
            component.defaultValue = this.jsonPathEvaluator.performJsonPathResolutionOnComponent(component, dataResolveContext);
        }
        if (component.type === 'content') {
            if (component.tags && component.tags.find(t => t === 'image')) {
                const imageType = component.properties ?
                    (component.properties['imageType'] ? component.properties['imageType'] : 'png') : 'png';
                const isImage = true;
                component.html = this.jsonPathEvaluator.performJsonPathResolution(component.key, component.html, dataResolveContext, {
                    isImage,
                    imageType
                });
            }
        }
    };


    handleNestedForms(form) {
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


    async createDataContext(keycloakContext, {processInstanceId, taskId}, customDataContext) {
        const email = keycloakContext.email;
        const headers = this.createHeader(keycloakContext);

        const [staffDetails, shiftDetails] = await Promise.all([
            this.platformDataService.getStaffDetails(email, headers),
            this.platformDataService.getShiftDetails(email, headers)
        ]);


        const staffDetailsContext = new StaffDetailsContext(staffDetails);
        const environmentContext = new EnvironmentContext(process.env);
        let shiftDetailsContext = null;

        if (shiftDetails) {
            const location = await this.platformDataService.getLocation(shiftDetails.currentlocationid, headers);
            let locationType = null;
            if (location.bflocationtypeid !== null) {
                locationType = await this.platformDataService.getLocationType(location.bflocationtypeid, headers);
            }
            shiftDetailsContext = new ShiftDetailsContext(shiftDetails, location, locationType);
        }

        if (taskId && processInstanceId) {
            const [taskData, processData, taskVariables] = await Promise.all([
                this.processService.getTaskData(taskId, headers),
                this.processService.getProcessVariables(processInstanceId, headers),
                this.processService.getTaskVariables(taskId, headers)
            ]);
            return new DataResolveContext(keycloakContext, staffDetailsContext,
                environmentContext,
                new ProcessContext(processData),
                new TaskContext(taskData, taskVariables), customDataContext, shiftDetailsContext);

        } else {
            return new DataResolveContext(keycloakContext,
                staffDetailsContext, environmentContext, null, null,
                customDataContext, shiftDetailsContext);
        }
    }

    createHeader(keycloakContext) {
        return {
            'Authorization': `Bearer ${keycloakContext.accessToken}`,
            'Content-Type': 'application/json',
            'Accept-Type': 'application/json'
        };
    };

}
