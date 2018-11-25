import FormTranslator from "../../src/services/FormTranslator";

process.env.NODE_ENV = 'test';
process.env.FORM_URL = 'http://localhost:8000';
process.env.WORKFLOW_URL = 'http://localhost:9000';
process.env.REFERENCE_DATA_URL = 'http://localhost:9001';
process.env.TX_DB_NAME = "test";



import JSONPath from "jsonpath";
import nock from 'nock';
import httpMocks from 'node-mocks-http';
import chai from 'chai';
import FormTranslateController from '../../src/controllers/FormTranslateController';
import * as forms from '../forms'
import * as tasks from '../task';
import FormEngineService from "../../src/services/FormEngineService";
import PlatformDataService from "../../src/services/PlatformDataService";
import ProcessService from "../../src/services/ProcessService";
import DataContextFactory from "../../src/services/DataContextFactory";

describe('Form Data Resolve Controller', () => {
    const expect = chai.expect;
    const translator = new FormTranslator(new FormEngineService(),
        new DataContextFactory(new PlatformDataService(), new ProcessService()));

    const formTranslateController = new FormTranslateController(translator);

    describe('A call to data resolve controller for process variables context', () => {
        beforeEach(() => {
            nock('http://localhost:8000')
                .get('/form?name=processContextForm')
                .reply(200, forms.processContextForm);
            nock('http://localhost:9000')
                .get('/api/workflow/tasks/taskId')
                .reply(200, tasks.taskData);
            nock('http://localhost:9000')
                .get('/api/workflow/tasks/taskId/variables')
                .reply(200, tasks.taskVariables);
            nock('http://localhost:9000')
                .get('/api/workflow/process-instances/processInstanceId/variables')
                .reply(200, tasks.processVariables);

            nock('http://localhost:9001')
                .get('/api/platform-data/staffview?email=eq.email')
                .reply(200, []);

            nock('http://localhost:9001')
                .get('/api/platform-data/shift?email=eq.email')
                .reply(200, []);


        });
        it('it should return an updated form schema for process context', async () => {
            const request = httpMocks.createRequest({
                method: 'GET',
                url: '/api/translation/form/processContextForm',
                params: {
                    formName: "processContextForm"
                },
                query: {
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


            const firstName = JSONPath.value(response, "$..components[?(@.key=='firstName')].defaultValue");
            const lastName = JSONPath.value(response, "$..components[?(@.key=='lastName')].defaultValue");
            const sessionId = JSONPath.value(response, "$..components[?(@.key=='id')].defaultValue");

            expect(firstName).to.equal("firstNameFromProcess");
            expect(lastName).to.equal("lastNameFromProcess");
            expect(sessionId).to.equal("idFromProcess");
        });
    });

    describe('A call to data resolve controller for task  context', () => {
        beforeEach(() => {
            nock('http://localhost:8000')
                .get('/form?name=taskContextForm')
                .reply(200, forms.taskContextForm);
            nock('http://localhost:9000')
                .get('/api/workflow/tasks/taskId')
                .reply(200, tasks.taskData);
            nock('http://localhost:9000')
                .get('/api/workflow/tasks/taskId/variables')
                .reply(200, tasks.taskVariables);
            nock('http://localhost:9000')
                .get('/api/workflow/process-instances/processInstanceId/variables')
                .reply(200, tasks.processVariables);

            nock('http://localhost:9001')
                .get('/api/platform-data/staffview?email=eq.email')
                .reply(200, []);
            nock('http://localhost:9001')
                .get('/api/platform-data/shift?email=eq.email')
                .reply(200, []);
        });
        it('it should return an updated form schema for task context', async () => {
            const request = httpMocks.createRequest({
                method: 'GET',
                url: '/api/translation/form/taskContextForm',
                params: {
                    formName: "taskContextForm"
                },
                query: {
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

            const firstName = JSONPath.value(response, "$..components[?(@.key=='firstName')].defaultValue");
            const lastName = JSONPath.value(response, "$..components[?(@.key=='lastName')].defaultValue");
            const sessionId = JSONPath.value(response, "$..components[?(@.key=='id')].defaultValue");
            const formName = JSONPath.value(response, "$..components[?(@.key=='formName')].defaultValue");

            expect(firstName).to.equal("firstNameFromProcess");
            expect(lastName).to.equal("lastNameFromProcess");
            expect(sessionId).to.equal("idFromProcess");
            expect(formName).to.equal("taskName");

        });
    });

    describe('A call to data resolve controller returns data even if task info is null', () => {
        beforeEach(() => {
            nock('http://localhost:8000')
                .get('/form?name=taskContextForm')
                .reply(200, forms.taskContextForm);
            nock('http://localhost:9000')
                .get('/api/workflow/tasks/taskId')
                .reply(404, {});
            nock('http://localhost:9000')
                .get('/api/workflow/tasks/taskId/variables')
                .reply(404, {});
            nock('http://localhost:9000')
                .get('/api/workflow/process-instance/processInstanceId/variables')
                .reply(404, { message: "process does not exist"});

            nock('http://localhost:9001')
                .get('/api/platform-data/staffview?email=eq.email')
                .reply(200, []);
            nock('http://localhost:9001')
                .get('/api/platform-data/shift?email=eq.email')
                .reply(200, []);
        });
        it('it should return an updated form without updated task/process info', async() => {
            const request = httpMocks.createRequest({
                method: 'GET',
                url: '/api/translation/form',
                params: {
                    formName: "taskContextForm"
                },
                query: {
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
            const response= await formTranslateController.getForm(request)
            expect(response).not.null
        });
    });


});
