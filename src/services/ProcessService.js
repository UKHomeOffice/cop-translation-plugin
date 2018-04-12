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
    return axios({
        url: `${process.env.WORKFLOW_URL}/api/workflow/process-instance/${processInstanceId}/variables`,
        method: 'GET',
        headers: headers
    });
};


export {
    getTaskData,
    getTaskVariables,
    getProcessVariables
}