import express from 'express';

import healthController from '../controllers/healthController';

const router = express.Router();

router
    .get('/healthz', [healthController.healthCheck])
    .get('/readiness', [healthController.readinessCheck]);

export default router;

