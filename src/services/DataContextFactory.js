import StaffDetailsContext from "../models/StaffDetailsContext";
import EnvironmentContext from "../models/EnvironmentContext";
import ShiftDetailsContext from "../models/ShiftDetailsContext";
import DataResolveContext from "../models/DataResolveContext";
import ProcessContext from "../models/ProcessContext";
import TaskContext from "../models/TaskContext";
import appConfig from "../config/appConfig";
import logger from "../config/winston";

export default class DataContextFactory {
    constructor(platformDataService, processService) {
        this.platformDataService = platformDataService;
        this.processService = processService;
    }

    async createDataContext(keycloakContext, {processInstanceId, taskId}, customDataContext) {
        const email = keycloakContext.email;
        const headers = this.createHeader(keycloakContext);

        const [staffDetails, shiftDetails] = await Promise.all([
            this.platformDataService.getStaffDetails(email, headers),
            this.platformDataService.getShiftDetails(email, headers)
        ]);

        const staffDetailsContext = new StaffDetailsContext(staffDetails);
        const environmentContext = new EnvironmentContext(appConfig);
        let shiftDetailsContext = null;

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
    }
}
