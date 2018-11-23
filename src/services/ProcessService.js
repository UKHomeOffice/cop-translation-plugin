import axios from "axios";
import * as logger from "../config/winston";


export default class ProcessService {
    constructor() {
        this.getTaskData = this.getTaskData.bind(this);
        this.getTaskVariables = this.getTaskVariables.bind(this);
        this.getProcessVariables = this.getProcessVariables.bind(this);
    }

     async getApiCall (url, headers) {
        try {
            return await axios({
                url: `${url}`,
                method: 'GET',
                headers: headers
            });
        } catch (err) {
            logger.error(`Failed to get data from ${url} due to ${err.toString}`);
            return null;
        }

    };

    async getTaskData(taskId, headers){
        return this.getApiCall(`${process.env.WORKFLOW_URL}/api/workflow/tasks/${taskId}`, headers);
    };

    async getTaskVariables  (taskId, headers)  {
        return this.getApiCall(`${process.env.WORKFLOW_URL}/api/workflow/tasks/${taskId}/variables`, headers);
    };
    async getProcessVariables (processInstanceId, headers) {
        return await this.getApiCall(`${process.env.WORKFLOW_URL}/api/workflow/process-instances/${processInstanceId}/variables`, headers);
    };
}
