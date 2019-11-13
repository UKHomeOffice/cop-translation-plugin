import {expect, formTranslateController} from '../setUpTests'
import JSONPath from 'jsonpath';
import nock from 'nock';
import httpMocks from 'node-mocks-http';
import * as forms from '../forms'
import * as tasks from '../task';

describe('Form Data Resolve Controller', () => {
    afterEach(() => {
        nock.cleanAll();
    });

    beforeEach(() => {
        nock('http://localhost:8000')
            .get('/form?name=processContextForm')
            .reply(200, {
                total: 1,
                forms: forms.processContextForm
            })
            .get('/form?name=taskContextForm')
            .reply(200, {
                total :1,
                forms: forms.taskContextForm
            });

        nock('http://localhost:9000')
            .get('/api/workflow/tasks/taskId')
            .reply(200, tasks.taskData)
            .get('/api/workflow/tasks/taskId/variables')
            .reply(200, tasks.taskVariables)
            .get('/api/workflow/process-instances/processInstanceId/variables')
            .reply(200, tasks.processVariables);

        nock('http://localhost:9001')
            .post('/v1/rpc/staffdetails', {
                argstaffemail: 'email'
            })
            .reply(200, [{
                staffid: 'abc-123',
                defaultteamid: '018d7442-4b4e-4ff3-acc6-f2d865a6e6ad'
            }])
            .post('/v1/rpc/extendedstaffdetails', {
                argstaffemail: 'email'
            })
            .reply(200, [{
                linemanager_email: 'linemanager@homeoffice.gov.uk'
            }])
            .get('/v1/shift?email=eq.email')
            .reply(200, [])
            .get('/v1/entities/team')
            .reply(200, {
                data: [{
                    id: '018d7442-4b4e-4ff3-acc6-f2d865a6e6ad'
                }]
            })
            .get('/v2/view_rolemembers?filter=rolelabel=eq.bfint')
            .reply(200, [{
                email: 'integritylead1@homeoffice.gov.uk',
                defaultteamid: '15a13c2a-fa63-4437-b4b0-d6b070e9c17e',
            }]);
    });

    describe('A call to data resolve controller for process variables context', () => {
        it('it should return an updated form schema for process context', async () => {
            const request = httpMocks.createRequest({
                method: 'GET',
                url: '/api/translation/form/processContextForm',
                params: {
                    id: 'processContextForm'
                },
                query: {
                    taskId: 'taskId',
                    processInstanceId : 'processInstanceId'
                },
                kauth: {
                    grant: {
                        access_token: {
                            token: 'test-token',
                            content: {
                                session_state: 'session_id',
                                email: 'email',
                                preferred_username: 'test',
                                given_name: 'testgivenname',
                                family_name: 'testfamilyname'
                            }
                        }

                    }
                }
            });

            const response = await formTranslateController.getForm(request);

            const firstName = JSONPath.value(response, "$..components[?(@.key=='firstName')].defaultValue");
            const lastName = JSONPath.value(response, "$..components[?(@.key=='lastName')].defaultValue");
            const sessionId = JSONPath.value(response, "$..components[?(@.key=='id')].defaultValue");

            expect(firstName).to.equal('firstNameFromProcess');
            expect(lastName).to.equal('lastNameFromProcess');
            expect(sessionId).to.equal('idFromProcess');
        });
    });

    describe('A call to data resolve controller for task  context', () => {
        beforeEach(() => {
            nock('http://localhost:9001')
                .post('/v1/rpc/staffdetails', {
                    argstaffemail: 'email'
                })
                .reply(200, [{
                    staffid: 'abc-123'
                }])
                .get('/v1/view_rolemembers?select=email&rolelabel=eq.bfint,&branchid=eq.undefined')
                .reply(200, []);
        });

        it('it should return an updated form schema for task context', async () => {
            const request = httpMocks.createRequest({
                method: 'GET',
                url: '/api/translation/form/taskContextForm',
                params: {
                    id: 'taskContextForm'
                },
                query: {
                    taskId: 'taskId',
                    processInstanceId : 'processInstanceId'
                },
                kauth: {
                    grant: {
                        access_token: {
                            token: 'test-token',
                            content: {
                                session_state: 'session_id',
                                email: 'email',
                                preferred_username: 'test',
                                given_name: 'testgivenname',
                                family_name: 'testfamilyname'
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

            expect(firstName).to.equal('firstNameFromProcess');
            expect(lastName).to.equal('lastNameFromProcess');
            expect(sessionId).to.equal('idFromProcess');
            expect(formName).to.equal('taskName');

        });
    });

    describe('A call to data resolve controller returns data even if task info is null', () => {
        beforeEach(() => {
            nock('http://localhost:9000')
                .get('/api/workflow/tasks/taskId')
                .reply(404, {})
                .get('/api/workflow/tasks/taskId/variables')
                .reply(404, {})
                .get('/api/workflow/process-instances/processInstanceId/variables')
                .reply(404, {});
        });

        it('it should return an updated form without updated task/process info', async() => {
            const request = httpMocks.createRequest({
                method: 'GET',
                url: '/api/translation/form',
                params: {
                    id: 'taskContextForm'
                },
                query: {
                    taskId: 'taskId',
                    processInstanceId : 'processInstanceId'
                },
                kauth: {
                    grant: {
                        access_token: {
                            token: 'test-token',
                            content: {
                                session_state: 'session_id',
                                email: 'email',
                                preferred_username: 'test',
                                given_name: 'testgivenname',
                                family_name: 'testfamilyname'
                            }
                        }

                    }
                }
            });
            const response= await formTranslateController.getForm(request);

            expect(response).not.null;
        });
    });
});
