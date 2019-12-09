import BusinessKeyGenerator from "../src/services/BusinessKeyGenerator";

process.env.NODE_ENV = 'test';

import DataContextFactory from "../src/services/DataContextFactory";
import PlatformDataService from "../src/services/PlatformDataService";
import ProcessService from "../src/services/ProcessService";

const appConfig = require('../src/config/appConfig');

appConfig.services.operationalData.url = 'http://localhost:9001';
appConfig.services.workflow.url = 'http://localhost:9000';
appConfig.services.referenceData.url = 'http://localhost:9001';
import MockRedis from "ioredis-mock/lib";

import chai from "chai";
import chaiAsPromised from "chai-as-promised";

const mockRedis = new MockRedis();
const referenceGenerator = new BusinessKeyGenerator(mockRedis);

const processService = new ProcessService(appConfig)
const platformDataService = new PlatformDataService(appConfig);
const dataContextFactory = new DataContextFactory(
    platformDataService,
    processService,
    referenceGenerator,
);

chai.use(chaiAsPromised);
const expect = chai.expect;

export {
    dataContextFactory,
    expect
}
