import express from 'express';
import heathRouter from './healthRoutes';
import formDataResolveRouter from './formDataResolveRoutes';

const router = express.Router();

const allowCrossDomain = (req, res, next) => {
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, PATCH, DELETE, OPTIONS');
    next();
};


const allApiRouter = (keycloak) => {
     router.use(heathRouter);
     router.use(formDataResolveRouter(keycloak));
     return router;

};

export default {
    allowCrossDomain,
    allApiRouter,
}

