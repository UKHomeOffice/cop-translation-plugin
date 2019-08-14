
process.env.NODE_ENV = 'test';

import FormTranslator from "../src/form/FormTranslator";
import FormEngineService from "../src/services/FormEngineService";
import DataContextFactory from "../src/services/DataContextFactory";
import PlatformDataService from "../src/services/PlatformDataService";
import ProcessService from "../src/services/ProcessService";
import FormTranslateController from "../src/controllers/FormTranslateController";
import fs from "fs";
import DataDecryptor from "../src/services/DataDecryptor";
import KeyRepository from "../src/services/KeyRepository";
import Tracing from "../src/utilities/tracing";

const appConfig = require('../src/config/appConfig');

appConfig.services.operationalData.url = 'http://localhost:9001'
appConfig.services.workflow.url = 'http://localhost:9000'
appConfig.services.form.url = 'http://localhost:8000';
appConfig.services.referenceData.url = 'http://localhost:9001';
appConfig.privateKey.path ='test/certs/enc.key';

import chai from "chai";
import chaiAsPromised from "chai-as-promised";

const keyRepository = new KeyRepository();
const key = Buffer.from("048edaf60d8bbd4f5bd11b4afc4ba4e607b4c86dd9798048d4f0060b07d54f177f5f24a3d58b76a24d1854a463d93e43db0918bffedda0d713d0a7d836f47310d10d14f8294f25526b335d68c25f77be92d9758fbb116246fd1572bb97d77a363e23b66ba005b0132b6df36cb686e446ff61b243d4193091a0f61efa9112d8b220", 'hex');
const iv = Buffer.from('W25/yzadEQNeV7jnZ3dnbA==', 'base64');
keyRepository.putKeys('hardcodedBusinessKey', key, iv);
const ecKey = Buffer.from(fs.readFileSync('test/certs/enc.key'));
console.log(`Key: ${ecKey.toString('base64')}`);
const dataDecryptor = new DataDecryptor(ecKey, keyRepository);

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
