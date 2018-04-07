import express from 'express';

import formDataResolveController from '../controllers/formDataResolveController';

const router = express.Router();

const formDataResolveRouter = (keycloak) => {
     router
        .get('/form/:formName', [keycloak.protect(), formDataResolveController.getFormSchema]);
     return router;
};

export default formDataResolveRouter;

