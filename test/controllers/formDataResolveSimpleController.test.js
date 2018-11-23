import FormTranslator from "../../src/services/FormTranslator";

process.env.NODE_ENV = 'test';
process.env.FORM_URL = 'http://localhost:8000';
process.env.WORKFLOW_URL = 'http://localhost:9000';
process.env.REFERENCE_DATA_URL = 'http://localhost:9001';
process.env.TX_DB_NAME = "test";



import JSONPath from "jsonpath";
import nock from 'nock';
import httpMocks from 'node-mocks-http';
import expect from 'expect';
import * as forms from '../forms'
import FormEngineService from "../../src/services/FormEngineService";
import PlatformDataService from "../../src/services/PlatformDataService";
import ProcessService from "../../src/services/ProcessService";
import FormTranslateController from "../../src/controllers/FormTranslateController";

describe('Form Data Resolve Controller', () => {
    const translator = new FormTranslator(new FormEngineService(),
        new PlatformDataService(), new ProcessService());

    const formTranslateController = new FormTranslateController(translator);

    describe('A call to data resolve controller with simple form', () => {
        beforeEach(() => {
            nock('http://localhost:8000')
                .get('/form?name=noContextData')
                .reply(200, forms.noContextData);
            nock('http://localhost:9001')
                .get('/api/staffview?email=eq.email')
                .reply(200, []);
            nock('http://localhost:9001')
                .get('/api/platform-data/shift?email=eq.email')
                .reply(200, []);
        });
        it('it should return form without any data resolution', async () => {
            const request = httpMocks.createRequest({
                method: 'GET',
                url: '/api/translation/form',
                params: {
                    formName: "noContextData"
                },
                kauth: {
                    grant: {
                        access_token: {
                            token: "test-token",
                            content: {
                                session_state: "session_id",
                                email: "email",
                                preferred_username: "test",
                                given_name: "testgivenname",
                                family_name: "testfamilyname"
                            }
                        }

                    }
                }
            });
            const response = await formTranslateController.getForm(request);

            const firstName = JSONPath.value(response, "$..components[?(@.key=='firstName')].defaultValue");
            const lastName = JSONPath.value(response, "$..components[?(@.key=='lastName')].defaultValue");

            expect(firstName).toEqual("Test");
            expect(lastName).toEqual("Test");

        });
    });

});
