import axios from "../utilities/axios";
import  logger from "../config/winston";


export default class ProcessService {

    constructor(config) {
        this.config = config;
    }

    async getApiCall(url, headers) {
        try {
            return await axios({
                url: `${url}`,
                method: 'GET',
                headers: headers
            });
        } catch (err) {
            logger.error(`Failed to get data from ${url} due to ${err}`);
            return null;
        }

    }

    async getTaskData(taskId, headers) {
        return this.getApiCall(`${this.config.services.workflow.url}/api/workflow/tasks/${taskId}`, headers);
    }

    async getTaskVariables(taskId, headers) {
        return this.getApiCall(`${this.config.services.workflow.url}/api/workflow/tasks/${taskId}/variables`, headers);
    }

    async getProcessVariables(processInstanceId, headers) {
        return await this.getApiCall(`${this.config.services.workflow.url}/api/workflow/process-instances/${processInstanceId}/variables`, headers);
    }

    validateStatus(status) {
        return status < 500;
    }

    async startProcessInstance(processData, headers) {
        try {
            const response = await axios.post(`${this.config.services.workflow.url}/api/workflow/process-instances`, processData, { validateStatus: this.validateStatus, headers: headers } );
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

    async completeTask(taskId, taskData, headers) {
        try {
            const response = await axios.post(`${this.config.services.workflow.url}/api/workflow/tasks/${taskId}/form/_complete`, taskData, { validateStatus: this.validateStatus, headers: headers } );
            if (response) {
                return {
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
