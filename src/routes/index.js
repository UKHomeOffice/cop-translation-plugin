import express from 'express';
import heathRouter from './healthRouter';
import formDataResolveRouter from './formDataResolveRouter';

const router = express.Router();

const allApiRouter = (keycloak) => {
     router.use(heathRouter);
     router.use(formDataResolveRouter(keycloak));
     return router;

};

export default {
    allApiRouter,
}

