import StaffDetailsContext from '../models/StaffDetailsContext';
import EnvironmentContext from '../models/EnvironmentContext';
import ShiftDetailsContext from '../models/ShiftDetailsContext';
import DataResolveContext from '../models/DataResolveContext';
import ProcessContext from '../models/ProcessContext';
import TaskContext from '../models/TaskContext';
import appConfig from '../config/appConfig';
import FormioUtils from "formiojs/utils";
import logger from "../config/winston";
import Tracing from "../utilities/tracing";
import BusinessKeyVisitor from "../form/BusinessKeyVisitor";
import FormComponent from "../models/FormComponent";

const getNamespace = require('cls-hooked').getNamespace;
export default class DataContextFactory {
    constructor(
        platformDataService,
        processService,
        referenceGenerator,
    ) {
        this.platformDataService = platformDataService;
        this.processService = processService;
        this.referenceGenerator = referenceGenerator;
        console.log("referenceGenerator" , this.referenceGenerator);
    }

    async createDataContext(keycloakContext, {processInstanceId, taskId}, customDataContext) {
        const session = getNamespace('requestId');
        return session.runAndReturn(async () => {
            Tracing.setCorrelationId(keycloakContext.correlationId);
            try {
                const email = keycloakContext.email;
                const headers = this.createHeader(keycloakContext);

                const [staffDetails, shiftDetails] = await Promise.all([
                    this.platformDataService.getStaffDetails(email, headers),
                    this.platformDataService.getShiftDetails(email, headers),
                ]);

                const staffDetailsContext = new StaffDetailsContext(staffDetails);
                const environmentContext = new EnvironmentContext(appConfig);

                let shiftDetailsContext = null;
                let extendedStaffDetailsContext = null;

                if (shiftDetails) {
                    const location = await this.platformDataService.getLocation(shiftDetails.locationid, headers);
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
                        this.createProcessContext(processData),
                        new TaskContext(taskData, taskVariables), customDataContext, shiftDetailsContext, extendedStaffDetailsContext);

                } else {
                    console.log('In here!');
                    return new DataResolveContext(keycloakContext,
                        staffDetailsContext, environmentContext, null, null,
                        customDataContext, shiftDetailsContext, extendedStaffDetailsContext);
                }
            } catch (e) {
                logger.error('Failed to load context', e);
                return null;
            } finally {
                logger.info('Data context resolution processed from plugin')
            }
        })

    }

    createProcessContext(processData) {
        return new ProcessContext(processData);
    }

    async postProcess(dataContext, form) {
        const components = form.components;
        const businessKeyVisitor = new BusinessKeyVisitor(this.referenceGenerator);
        FormioUtils.eachComponent(components, async (component) => {
            const formComponent = new FormComponent(component, dataContext);
            await formComponent.accept(businessKeyVisitor);
        });

        return Promise.resolve(form);
    }

    createHeader(keycloakContext) {
        return {
            'Authorization': `Bearer ${keycloakContext.accessToken}`,
            'Content-Type': 'application/json',
            'Accept-Type': 'application/json'
        };
    }

}
