import express from 'express';
import heathRouter from './healthRouter';
import formDataResolveRouter from './formDataResolveRouter';
import workflowSubmissionRouter from './workflowSubmissionRouter';

const router = express.Router();

const allApiRouter = (keycloak, formTranslateController, workflowTranslatorController) => {
     router.use(heathRouter);
     router.use(formDataResolveRouter(keycloak, formTranslateController));
     router.use(workflowSubmissionRouter(keycloak, workflowTranslatorController));
     return router;

};

export default {
    allApiRouter,
}

