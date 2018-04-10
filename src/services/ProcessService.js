import axios from "axios";
import * as logger from 'winston';

const getTaskData = async (taskId, headers) => {
    return axios({
        url: `${process.env.WORKFLOW_URL}/api/workflow/tasks/${taskId}`,
        method: 'GET',
        headers: headers
    });

};

const getTaskVariables = async (taskId, headers) => {
    return axios({
        url: `${process.env.WORKFLOW_URL}/api/workflow/tasks/${taskId}/variables`,
        method: 'GET',
        headers: headers
    })

};
const getProcessVariables = async (processInstanceId, headers) => {
    try {
        return axios({
            url: `${process.env.WORKFLOW_URL}/api/workflow/process-instance/${processInstanceId}/variables`,
            method: 'GET',
            headers: headers
        });
    } catch (e) {
        logger.error("Failed to get process variable data %s", e);
        throw e;
    }

};


export {
    getTaskData,
    getTaskVariables,
    getProcessVariables
}