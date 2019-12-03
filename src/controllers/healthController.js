import responseHandler from "../utilities/handlers/responseHandler";
import  logger from "../config/winston";

const healthCheck = (req, res) => {
    logger.silly("Health check initiated");
    responseHandler.healthRes(null, {"status": "OK"}, res);
};

const readinessCheck = (req, res) => {
    logger.silly("Readiness check initiated");
    responseHandler.healthRes(null, {"ready" : true}, res);
};

export default {
    healthCheck,
    readinessCheck
};
