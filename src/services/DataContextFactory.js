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
            logger.info('Location in createDataContext');
            logger.info(location);
            logger.info('--------------------');
            let locationType = null;
            if (location.bflocationtypeid !== null) {
                logger.info('getting locationtype');
                locationType = await this.platformDataService.getLocationType(location.bflocationtypeid, headers);
            }
            logger.info('locationType in createDataContext');
            logger.info(locationType);
            logger.info('--------------------');
            shiftDetailsContext = new ShiftDetailsContext(shiftDetails, location, locationType);
            logger.info('shiftDetailsContext in createDataContext');
            logger.info(shiftDetailsContext);
            logger.info('--------------------');
        }

        logger.info(`taskId in createDataContext = ${taskId}`);
        logger.info(`processInstanceId in createDataContext = ${processInstanceId}`);

        if (taskId && processInstanceId) {
            const [taskData, processData, taskVariables] = await Promise.all([
                this.processService.getTaskData(taskId, headers),
                this.processService.getProcessVariables(processInstanceId, headers),
                this.processService.getTaskVariables(taskId, headers)
            ]);
            logger.info('taskData in createDataContext');
            logger.info(taskData);
            logger.info('--------------------');
            logger.info('processData in createDataContext');
            logger.info(processData);
            logger.info('--------------------');
            logger.info('taskVariables in createDataContext');
            logger.info(taskVariables);
            logger.info('--------------------');
            return new DataResolveContext(keycloakContext, staffDetailsContext,
                environmentContext,
                new ProcessContext(processData),
                new TaskContext(taskData, taskVariables), customDataContext, shiftDetailsContext);

        } else {
            logger.info('taskId or processId are not set');
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
