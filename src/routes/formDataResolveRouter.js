import express from 'express';

import FormDataResolveController from '../controllers/FormTranslateController';
import responseHandler from "../utilities/handlers/responseHandler";
import ProcessService from "../services/ProcessService";
import FormTranslator from "../form/FormTranslator";
import FormEngineService from "../services/FormEngineService";
import PlatformDataService from "../services/PlatformDataService";
import DataContextFactory from "../services/DataContextFactory";
import DataDecryptor from "../services/DataDecryptor";
import fs from "fs";

const router = express.Router();

const path = process.env.PRIVATE_KEY_PATH || '/enccerts/mobileid-key.pem';
const rsaKey = fs.readFileSync(path);

const dataDecryptor = new DataDecryptor(rsaKey);

const dataContextFactory = new DataContextFactory(new PlatformDataService(), new ProcessService());

const translator = new FormTranslator(new FormEngineService(), dataContextFactory, dataDecryptor);

const formTranslatorController = new FormDataResolveController(translator);

const formDataResolveRouter = (keycloak) => {

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

