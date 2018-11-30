import FormTranslator from "../../src/form/FormTranslator";

process.env.NODE_ENV = 'test';
process.env.FORM_URL = 'http://localhost:8000';
process.env.WORKFLOW_URL = 'http://localhost:9000';
process.env.PLATFORM_DATA_URL = 'http://localhost:9001';



import JSONPath from "jsonpath";
import nock from 'nock';
import httpMocks from 'node-mocks-http';
import expect from 'expect';
import * as forms from '../forms'
import FormEngineService from "../../src/services/FormEngineService";
import PlatformDataService from "../../src/services/PlatformDataService";
import ProcessService from "../../src/services/ProcessService";
import FormTranslateController from "../../src/controllers/FormTranslateController";
import DataContextFactory from "../../src/services/DataContextFactory";
import fs from "fs";
import DataDecryptor from "../../src/services/DataDecryptor";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";

describe('Form Data Resolve Controller', () => {
    const rsaKey = fs.readFileSync('test/certs/signing1.key');
    const dataDecryptor = new DataDecryptor(rsaKey);

    const translator = new FormTranslator(new FormEngineService(),
        new DataContextFactory(new PlatformDataService(), new ProcessService()), dataDecryptor);

    const formTranslateController = new FormTranslateController(translator);

    chai.use(chaiAsPromised);
    const expect = chai.expect;

    describe('A call to data resolve controller for user details  context', () => {
        beforeEach(() => {
            nock('http://localhost:8000')
                .get('/form?name=userDetailsContextForm')
                .reply(500, []);
            nock('http://localhost:9001')
                .get('/api/platform-data/staffview?email=eq.emailTest123')
                .reply(200,

                    [
                        {
                            "phone": "phone",
                            "email": "emailTest123",
                            "gradetypeid": "gradetypeid",
                            "firstname": "firstname",
                            "surname": "surname",
                            "qualificationtypes": [
                                {
                                    "qualificationname": "dummy",
                                    "qualificationtype": "1"
                                },
                                {
                                    "qualificationname": "staff",
                                    "qualificationtype": "2"
                                }
                            ],
                            "staffid": "staffid",
                            "gradename": "grade"
                        }
                    ]);

            nock('http://localhost:9001')
                .get('/api/platform-data/shift?email=eq.emailTest123')
                .reply(200, []);
        });
        it('it should return an updated form schema for user details context', async () => {
            const request = httpMocks.createRequest({
                method: 'GET',
                url: '/api/translation/form/userDetailsContextForm',
                params: {
                    formName: "userDetailsContextForm"
                },
                kauth: {
                    grant: {
                        access_token: {
                            token: "test-token",
                            content: {
                                session_state: "session_id",
                                email: "emailTest123",
                                preferred_username: "test",
                                given_name: "firstname",
                                family_name: "surname"
                            }
                        }

                    }
                }
            });

            await expect(formTranslateController.getForm(request)).to.eventually.be.rejectedWith(`An exception occurred while trying to get form userDetailsContextForm ... 'Error: Request failed with status code 500'`);
        });
    });

});
