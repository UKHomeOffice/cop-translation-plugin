
process.env.NODE_ENV = 'test';

import FormTranslator from "../src/form/FormTranslator";
import FormEngineService from "../src/services/FormEngineService";
import DataContextFactory from "../src/services/DataContextFactory";
import PlatformDataService from "../src/services/PlatformDataService";
import ProcessService from "../src/services/ProcessService";
import FormTranslateController from "../src/controllers/FormTranslateController";
import fs from "fs";
import DataDecryptor from "../src/services/DataDecryptor";
import Tracing from "../src/utilities/tracing";

const appConfig = require('../src/config/appConfig');

appConfig.services.operationalData.url = 'http://localhost:9001'
appConfig.services.workflow.url = 'http://localhost:9000'
appConfig.services.form.url = 'http://localhost:8000';
appConfig.services.referenceData.url = 'http://localhost:9001';
appConfig.privateKey.path ='test/certs/enc.key';

import chai from "chai";
import chaiAsPromised from "chai-as-promised";

const ecKey = Buffer.from(fs.readFileSync('test/certs/enc.key', 'utf8'), 'hex');
const dataDecryptor = new DataDecryptor(ecKey);

const translator = new FormTranslator(new FormEngineService(appConfig),
    new DataContextFactory(new PlatformDataService(appConfig), new ProcessService(appConfig)), dataDecryptor);

const formTranslateController = new FormTranslateController(translator);
Tracing.correlationId = () => "CorrelationId";

chai.use(chaiAsPromised);
const expect = chai.expect;

export {
    formTranslateController,
    expect
}
