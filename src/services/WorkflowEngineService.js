import axios from "../utilities/axios";
import  logger from "../config/winston";
import TranslationServiceError from "../TranslationServiceError";

export default class WorkflowEngineService {

    constructor(config) {
        this.config = config;
    }

    validateStatus(status) {
        return status < 500;
    }

    async startProcessInstance(processData) {
        try {
            const response = await axios.post(`${this.config.services.workflow.url}/api/workflow/process-instances`, processData, { validateStatus: this.validateStatus} );
            if (response && response.data) {
                return {
                  data: response.data,
                  status: response.status
                }
            }
            return null;
        } catch (e) {
            const errorMessage = `An exception occurred while trying to start process ${processData.processKey} ... '${e}'`;
            logger.error(errorMessage, e);
            throw new TranslationServiceError(errorMessage, 500);
        }
    }

    async completeTask(taskId, taskData) {
        try {
            const response = await axios.post(`${this.config.services.workflow.url}/api/workflow/tasks/${taskId}/form/_complete`, taskData, { validateStatus: this.validateStatus} );
            if (response && response.data) {
                return {
                  data: response.data,
                  status: response.status
                }
            }
            return null;
        } catch (e) {
            const errorMessage = `An exception occurred while trying to complete task ${taskId} ... '${e}'`;
            logger.error(errorMessage, e);
            throw new TranslationServiceError(errorMessage, 500);
        }
    }
}
