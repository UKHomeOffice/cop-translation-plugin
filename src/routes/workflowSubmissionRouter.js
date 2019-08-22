import express from 'express';
import responseHandler from "../utilities/handlers/responseHandler";
import logger from "../config/winston";

const router = express.Router();

const workflowSubmissionRouter = (keycloak, workflowTranslatorController) => {
    router
        .post('/tasks/:taskId/form/_complete', [keycloak.protect(), (req, res) => {
            workflowTranslatorController.completeTask(req).then((response) => {
                return res.status(response.status).json(response.data);
            }).catch((err) => {
                logger.error(`Error completing task ${err.message}`, err);
                responseHandler.res({
                    code: err.code,
                    message: err.toString()
                }, {}, res);
            });
        }]);
    router
        .post('/workflow/process-instances', [keycloak.protect(), (req, res) => {
            workflowTranslatorController.startProcessInstance(req).then((response) => {
                return res.status(response.status).json({});
            }).catch((err) => {
                logger.error(`Error starting process ${err.message}`, err);
                responseHandler.res({
                    code: err.code,
                    message: err.toString()
                }, {}, res);
            });
        }]);
    return router;
};

export default workflowSubmissionRouter;

