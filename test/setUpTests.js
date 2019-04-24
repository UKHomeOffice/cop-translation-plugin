
process.env.NODE_ENV = 'test';
process.env.FORM_URL = 'http://localhost:8000';
process.env.WORKFLOW_URL = 'http://localhost:9000';
process.env.PLATFORM_DATA_URL = 'http://localhost:9001';
process.env.PRIVATE_KEY_PATH='test/certs/signing1.key';

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

import chai from "chai";
import chaiAsPromised from "chai-as-promised";

const rsaKey = fs.readFileSync('test/certs/signing1.key');
const dataDecryptor = new DataDecryptor(rsaKey);

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
