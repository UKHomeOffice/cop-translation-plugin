import StaffDetailsContext from "../models/StaffDetailsContext";
import EnvironmentContext from "../models/EnvironmentContext";
import ShiftDetailsContext from "../models/ShiftDetailsContext";
import DataResolveContext from "../models/DataResolveContext";
import ExtendedStaffDetailsContext from '../models/ExtendedStaffDetailsContext';
import ProcessContext from "../models/ProcessContext";
import TaskContext from "../models/TaskContext";
import appConfig from "../config/appConfig";

export default class DataContextFactory {
    constructor(platformDataService, processService, dataDecryptor, referenceGenerator) {
        this.platformDataService = platformDataService;
        this.processService = processService;
        this.dataDecryptor = dataDecryptor;
        this.referenceGenerator = referenceGenerator
    }

    async createDataContext(keycloakContext, {processInstanceId, taskId}, customDataContext) {
        const email = keycloakContext.email;
        const headers = this.createHeader(keycloakContext);

        const [staffDetails, shiftDetails, extendedStaffDetails] = await Promise.all([
            this.platformDataService.getStaffDetails(email, headers),
            this.platformDataService.getShiftDetails(email, headers),
            this.platformDataService.getExtendedStaffDetails(email, headers)
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

        if (staffDetails) {
            const integrityLeadEmail = await this.platformDataService.getIntegrityLeadEmails(staffDetails.branchId, headers);
            extendedStaffDetailsContext = new ExtendedStaffDetailsContext(extendedStaffDetails, integrityLeadEmail);
        }

        if (taskId && processInstanceId) {
            const [taskData, processData, taskVariables] = await Promise.all([
                this.processService.getTaskData(taskId, headers),
                this.processService.getProcessVariables(processInstanceId, headers),
                this.processService.getTaskVariables(taskId, headers)
            ]);
            return new DataResolveContext(keycloakContext, staffDetailsContext,
                environmentContext,
                await this.createProcessContext(processData),
                new TaskContext(taskData, taskVariables), customDataContext, shiftDetailsContext, extendedStaffDetailsContext);

        } else {
            return new DataResolveContext(keycloakContext,
                staffDetailsContext, environmentContext, await this.createProcessContext([]), null,
                customDataContext, shiftDetailsContext, extendedStaffDetailsContext);
        }
    }

    async createProcessContext(processData) {
        const processContext = new ProcessContext(processData);
        if (!processContext.businessKey) {
          processContext.businessKey = await this.referenceGenerator.newBusinessKey();
        }
        processContext.encryptionMetaData = await this.dataDecryptor.ensureKeys(processContext.businessKey);
        return processContext;
    }

    createHeader(keycloakContext) {
        return {
            'Authorization': `Bearer ${keycloakContext.accessToken}`,
            'Content-Type': 'application/json',
            'Accept-Type': 'application/json'
        };
    }

    createSubmissionContext(formData) {
      const businessKey = formData.data.businessKey;
      if (businessKey) {
        const keys = this.dataDecryptor.ensureKeys(businessKey);
        return {
          businessKey: businessKey,
          encryptionMetaData: keys,
        };
      }
      return { };
    }
}
