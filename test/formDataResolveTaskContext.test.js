process.env.NODE_ENV = 'test';
process.env.FORM_URL = 'http://localhost:8000';
process.env.WORKFLOW_URL = 'http://localhost:9000';
process.env.REFERENCE_DATA_URL = 'http://localhost:9001';


import JSONPath from "jsonpath";
import nock from 'nock';
import httpMocks from 'node-mocks-http';
import expect from 'expect';
import formDataController from '../src/controllers/formDataResolveController';
import * as forms from './forms'
import * as tasks from './task';

describe('Form Data Resolve Controller', () => {

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
                .get('/api/workflow/process-instance/processInstanceId/variables')
                .reply(200, tasks.processVariables);

            nock('http://localhost:9001')
                .get('/api/reference-data/staffattributes?_join=inner:person:staffattributes.personid:$eq:person.personid&staffattributes.email=email')
                .reply(200, []);


        });
        it('it should return an updated form schema for process context', (done) => {
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
            const response = httpMocks.createResponse({
                eventEmitter: require('events').EventEmitter
            });

            formDataController.getFormSchema(request, response);
            response.on('end', () => {
                expect(response.statusCode).toEqual(200);
                expect(response._isEndCalled()).toBe(true);
                const updatedForm = JSON.parse(response._getData());

                const firstName = JSONPath.value(updatedForm, "$..components[?(@.key=='firstName')].defaultValue");
                const lastName = JSONPath.value(updatedForm, "$..components[?(@.key=='lastName')].defaultValue");
                const sessionId = JSONPath.value(updatedForm, "$..components[?(@.key=='id')].defaultValue");

                expect(firstName).toEqual("firstNameFromProcess");
                expect(lastName).toEqual("lastNameFromProcess");
                expect(sessionId).toEqual("idFromProcess");
                done();
            });
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
                .get('/api/workflow/process-instance/processInstanceId/variables')
                .reply(200, tasks.processVariables);

            nock('http://localhost:9001')
                .get('/api/reference-data/staffattributes?_join=inner:person:staffattributes.personid:$eq:person.personid&staffattributes.email=email')
                .reply(200, []);
        });
        it('it should return an updated form schema for task context', (done) => {
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
            const response = httpMocks.createResponse({
                eventEmitter: require('events').EventEmitter
            });

            formDataController.getFormSchema(request, response);
            response.on('end', () => {
                expect(response.statusCode).toEqual(200);
                expect(response._isEndCalled()).toBe(true);
                const updatedForm = JSON.parse(response._getData());

                const firstName = JSONPath.value(updatedForm, "$..components[?(@.key=='firstName')].defaultValue");
                const lastName = JSONPath.value(updatedForm, "$..components[?(@.key=='lastName')].defaultValue");
                const sessionId = JSONPath.value(updatedForm, "$..components[?(@.key=='id')].defaultValue");
                const formName = JSONPath.value(updatedForm, "$..components[?(@.key=='formName')].defaultValue");

                expect(firstName).toEqual("firstNameFromProcess");
                expect(lastName).toEqual("lastNameFromProcess");
                expect(sessionId).toEqual("idFromProcess");
                expect(formName).toEqual("taskName");

                done();
            });
        });
    });

    describe('A call to data resolve controller throws 400 if task context does not exist', () => {
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
                .get('/api/reference-data/staffattributes?_join=inner:person:staffattributes.personid:$eq:person.personid&staffattributes.email=email')
                .reply(200, []);
        });
        it('it should return an updated form schema for task context', (done) => {
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
            const response = httpMocks.createResponse({
                eventEmitter: require('events').EventEmitter
            });

            formDataController.getFormSchema(request, response);
            response.on('end', () => {
                expect(response.statusCode).toEqual(400);
                expect(response._isEndCalled()).toBe(true);

                done();
            });
        });
    });


});