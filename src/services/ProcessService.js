import axios from "axios";
import * as logger from 'winston';



const getApiCall = ( url, headers) => {
    return axios({
        url: `${url}`,
        method: 'GET',
        headers: headers
    });
};

const getTaskData = async (taskId, headers) => {
    return getApiCall(`${process.env.WORKFLOW_URL}/api/workflow/tasks/${taskId}`, headers);
};

const getTaskVariables = async (taskId, headers) => {
    return getApiCall(`${process.env.WORKFLOW_URL}/api/workflow/tasks/${taskId}/variables`, headers);
};
const getProcessVariables = async (processInstanceId, headers) => {
    return getApiCall( `${process.env.WORKFLOW_URL}/api/workflow/process-instances/${processInstanceId}/variables`, headers);
};


export {
    getTaskData,
    getTaskVariables,
    getProcessVariables
}