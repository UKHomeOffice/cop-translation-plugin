import express from 'express';
import responseHandler from "../utilities/handlers/responseHandler";
import logger from "../config/winston";

const router = express.Router();

const formDataResolveRouter = (keycloak, formTranslatorController) => {

    router
        .get('/form/:formName',
            [keycloak.protect(), (req, res) => {
                const {formName} = req.params;
                formTranslatorController.getForm(req).then((form) => {
                    logger.info('In formTranslatorController.getForm');
                    logger.info(form);
                    logger.info(`Sending form ${form.name} to responseHandler`);
                    responseHandler.res(null, {formName, form}, res);
                }).catch((err) => {
                    logger.info('Error in formTranslatorController.getForm');
                    logger.info(err.code);
                    logger.info(err.message);
                    logger.info('-----------');
                    responseHandler.res({
                        code: err.code,
                        message: err.message
                    }, {formName}, res);
                })

            }]);
    router
        .post('/form', [keycloak.protect(), (req, res) => {
            formTranslatorController.getFormWithContext(req).then((form) => {
                logger.info('In formTranslatorController.getFormWithContext');
                logger.info(form);
                responseHandler.res(null, {form}, res);
            }).catch((err) => {
                logger.info('Error in formTranslatorController.getFormWithContext');
                logger.info(err.code);
                logger.info(err.toString());
                logger.info('-----------');
                responseHandler.res({
                    code: err.code,
                    message: err.toString()
                }, {}, res);
            });
        }]);
    return router;
};

export default formDataResolveRouter;

