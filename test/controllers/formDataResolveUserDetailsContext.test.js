import FormTranslator from "../../src/services/FormTranslator";

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

describe('Form Data Resolve Controller', () => {
    const translator = new FormTranslator(new FormEngineService(),
        new DataContextFactory(new PlatformDataService(), new ProcessService()));

    const formTranslateController = new FormTranslateController(translator);


    describe('A call to data resolve controller for user details  context', () => {
        beforeEach(() => {
            nock('http://localhost:8000')
                .get('/form?name=userDetailsContextForm')
                .reply(200, forms.userDetailsContextForm);
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
            const response = await formTranslateController.getForm(request);

            const grade = JSONPath.value(response, "$..components[?(@.key=='grade')].defaultValue");
            const personId = JSONPath.value(response, "$..components[?(@.key=='personid')].defaultValue");

            expect(grade).toEqual("gradetypeid");
            expect(personId).toEqual("staffid");
        });
    });

    describe('A call to data resolve controller for with details for user context', () => {
        beforeEach(() => {
            nock('http://localhost:8000')
                .log(console.log)
                .get('/form?name=userDetailsContextForm')
                .reply(200, forms.userDetailsContextForm);
            nock('http://localhost:9001')
                .log(console.log)
                .get('/api/platform-data/staffview?email=eq.noEmail')
                .reply(200, []);
            nock('http://localhost:9001')
                .get('/api/platform-data/shift?email=eq.noEmail')
                .reply(200, []);
        });
        it('it should return an updated form schema with null values', async () => {
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
                                email: "noEmail",
                                preferred_username: "test",
                                given_name: "testgivenname",
                                family_name: "testfamilyname"
                            }
                        }

                    }
                }
            });
            const response = await formTranslateController.getForm(request);

            const grade = JSONPath.value(response, "$..components[?(@.key=='grade')].defaultValue");

            expect(grade).toEqual(null);
        });
    });
});
