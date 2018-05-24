import express from 'express';

import formDataResolveController from '../controllers/formDataResolveController';

const router = express.Router();

const wrap = fn => (...args) => fn(...args).catch(args[2]);

const formDataResolveRouter = (keycloak) => {
    router
        .get('/form/:formName',
            [keycloak.protect(), wrap(formDataResolveController.getFormSchema)]);
    router
        .post('/form', [keycloak.protect(), wrap(formDataResolveController.getFormSchemaForContext)]);
    return router;
};

export default formDataResolveRouter;

