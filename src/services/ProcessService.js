import axios from "axios";
import * as logger from 'winston';


const getApiCall = async (url, headers) => {
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

const getTaskData = async (taskId, headers) => {
    return getApiCall(`${process.env.WORKFLOW_URL}/api/workflow/tasks/${taskId}`, headers);
};

const getTaskVariables = async (taskId, headers) => {
    return getApiCall(`${process.env.WORKFLOW_URL}/api/workflow/tasks/${taskId}/variables`, headers);
};
const getProcessVariables = async (processInstanceId, headers) => {
    return getApiCall(`${process.env.WORKFLOW_URL}/api/workflow/process-instances/${processInstanceId}/variables`, headers);
};


export {
    getTaskData,
    getTaskVariables,
    getProcessVariables
}