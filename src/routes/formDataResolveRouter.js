import express from 'express';
import responseHandler from "../utilities/handlers/responseHandler";
import logger from "../config/winston";

const router = express.Router();

const formDataResolveRouter = (keycloak, formTranslatorController) => {

    router
        .get('/form/:id',
            [keycloak.protect(), (req, res) => {
                const {id} = req.params;
                formTranslatorController.getForm(req).then((form) => {
                    responseHandler.res(null, {id, form}, res);
                }).catch((err) => {
                    logger.error(`Error translating form ${err.message}`, err);
                    responseHandler.res({
                        code: err.code,
                        message: err.message
                    }, {id}, res);
                })

            }]);
    router
        .post('/form', [keycloak.protect(), (req, res) => {
            formTranslatorController.getFormWithContext(req).then((form) => {
                responseHandler.res(null, {form}, res);
            }).catch((err) => {
                logger.error(`Error translating form ${err.message}`, err);
                responseHandler.res({
                    code: err.code,
                    message: err.toString()
                }, {}, res);
            });
        }]);
    router
        .post('/form/:formId/shift', [keycloak.protect(), (req, res) => {
            logger.info("Submitting shift form");
            formTranslatorController.submitShiftForm(req).then((form) => {
                return res.status(form.status).json(form.data);
            }).catch((err) => {
                logger.error(`Error submitting form ${err.message}`, err);
                responseHandler.res({
                    code: err.code,
                    message: err.toString()
                }, {}, res);
            });
        }]);
    router
        .post('/form/:formId/submission', [keycloak.protect(), (req, res) => {
            formTranslatorController.submitForm(req).then((form) => {
                return res.status(form.status).json(form.data);
            }).catch((err) => {
                logger.error(`Error submitting form ${err.message}`, err);
                responseHandler.res({
                    code: err.code,
                    message: err.toString()
                }, {}, res);
            });
        }]);
    return router;
};

export default formDataResolveRouter;

