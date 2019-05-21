import express from 'express';
import responseHandler from "../utilities/handlers/responseHandler";

const router = express.Router();

const formDataResolveRouter = (keycloak, formTranslatorController) => {

    router
        .get('/form/:formName',
            [keycloak.protect(), (req, res) => {
                const {formName} = req.params;
                formTranslatorController.getForm(req).then((form) => {
                    responseHandler.res(null, {formName, form}, res);
                }).catch((err) => {
                    responseHandler.res({
                        code: err.code,
                        message: err.message
                    }, {formName}, res);
                })

            }]);
    router
        .post('/form', [keycloak.protect(), (req, res) => {
            formTranslatorController.getFormWithContext(req).then((form) => {
                responseHandler.res(null, {form}, res);
            }).catch((err) => {
                responseHandler.res({
                    code: err.code,
                    message: err.toString()
                }, {}, res);
            });
        }]);
    return router;
};

export default formDataResolveRouter;

