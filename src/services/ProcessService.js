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
}
