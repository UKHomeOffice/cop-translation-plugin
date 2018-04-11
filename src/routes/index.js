import express from 'express';
import heathRouter from './healthRoutes';
import formDataResolveRouter from './formDataResolveRoutes';

const router = express.Router();

const allApiRouter = (keycloak) => {
     router.use(heathRouter);
     router.use(formDataResolveRouter(keycloak));
     return router;

};

export default {
    allApiRouter,
}

