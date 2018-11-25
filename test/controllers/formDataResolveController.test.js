import * as tasks from "../task";

process.env.NODE_ENV = 'test';
process.env.FORM_URL = 'http://localhost:8000';
process.env.WORKFLOW_URL = 'http://localhost:9000';
process.env.PLATFORM_DATA_URL = 'http://localhost:9001';

import JSONPath from "jsonpath";
import nock from 'nock';
import httpMocks from 'node-mocks-http';
import expect from 'expect';
import FormTranslateController from '../../src/controllers/FormTranslateController';
import * as forms from '../forms'
import FormTranslator from "../../src/services/FormTranslator";
import FormEngineService from "../../src/services/FormEngineService";
import PlatformDataService from "../../src/services/PlatformDataService";
import ProcessService from "../../src/services/ProcessService";

describe('Form Data Resolve Controller', () => {
    const translator = new FormTranslator(new FormEngineService(),
        new PlatformDataService(), new ProcessService());

    const formTranslateController = new FormTranslateController(translator);

    describe('A call to data resolve controller for input type', () => {
        beforeEach(() => {
            nock('http://localhost:8000')
                .get('/form?name=testForm')
                .reply(200, forms.simpleForm);
            nock('http://localhost:9001')
                .get('/api/platform-data/staffview?email=eq.email')
                .reply(200, []);
            nock('http://localhost:9001')
                .get('/api/platform-data/shift?email=eq.email')
                .reply(200, []);
        });

        it('it should return an updated form schema for keycloakContext', async () => {
            const request = httpMocks.createRequest({
                method: 'GET',
                url: '/api/translation/form/testFrom',
                params: {
                    formName: "testForm"
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
            const sessionId = JSONPath.value(response, "$..components[?(@.key=='sessionId')].defaultValue");

            expect(firstName).toEqual("testgivenname");
            expect(lastName).toEqual("testfamilyname");
            expect(sessionId).toEqual("session_id");
        });
    });

    describe('A call to data resolve controller for url type', () => {
        beforeEach(() => {
            nock('http://localhost:8000')
                .log(console.log)
                .get('/form?name=dataUrlForm')
                .reply(200, forms.dataUrlForm);
            nock('http://localhost:9001')
                .get('/api/platform-data/staffview?email=eq.email')
                .reply(200, []);
            nock('http://localhost:9000')
                .get('/api/workflow/tasks/taskId/variables')
                .reply(200, tasks.taskVariables);
            nock('http://localhost:9000')
                .get('/api/workflow/process-instances/processInstanceId/variables')
                .reply(200, tasks.processVariables);
            nock('http://localhost:9001')
                .get('/api/platform-data/shift?email=eq.email')
                .reply(200, []);

        });
        it('it should return an updated form schema for url', async () => {
            const request = httpMocks.createRequest({
                method: 'GET',
                url: '/api/translation/form/dataUrlForm',
                params: {
                    formName: "dataUrlForm"
                }, query: {
                    taskId: "taskId",
                    processInstanceId : 'processInstanceId'
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
            const url = JSONPath.value(response, "$..components[?(@.key=='regionid')].data.url");
            const defaultValue = JSONPath.value(response, "$..components[?(@.key=='regionid')].defaultValue");
            expect(url).toEqual("http://localhost:9001/region");
            expect(defaultValue).toEqual("firstNameFromProcess");


        });
    });

});
