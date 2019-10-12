import JSONPath from "jsonpath";
import nock from 'nock';
import httpMocks from 'node-mocks-http';
import * as forms from '../forms'
import * as tasks from '../task';
import {expect, formTranslateController} from '../setUpTests'

const tracingHeader = {
    reqheaders: {
        nginxId: 'CorrelationId'
    }
};

describe('Form Data Resolve Controller Tracing', () => {
    describe('A call to data resolve controller for with details for user context', () => {
        beforeEach(() => {
            nock('http://localhost:8000', tracingHeader)
                .log(console.log)
                .get('/form?name=userDetailsContextForm')
                .reply(200,{
                    total :1,
                    forms:  forms.userDetailsContextForm
                })
                .get('/form?name=processContextForm')
                .reply(200, {
                    total: 1,
                    forms: forms.processContextForm
                });

            nock('http://localhost:9000', tracingHeader)
                .get('/api/workflow/tasks/taskId')
                .reply(200, tasks.taskData)
                .get('/api/workflow/tasks/taskId/variables')
                .reply(200, tasks.taskVariables)
                .get('/api/workflow/process-instances/processInstanceId/variables')
                .reply(200, tasks.processVariables);

            nock('http://localhost:9001', tracingHeader)
                .log(console.log)
                .post('/v1/rpc/staffdetails', {
                    "argstaffemail": "noEmail"
                })
                .reply(200, [])
                .get('/v1/shift?email=eq.noEmail')
                .reply(200, [])
                .post('/v1/rpc/extendedstaffdetails', {
                    argstaffemail: 'email'
                })
                .reply(200, [{
                    linemanager_email: 'linemanager@homeoffice.gov.uk'
                }]);
        });

        describe('A call to data resolve controller for process variables context', () => {
            it('it should return an updated form schema for process context with tracing headers', async () => {
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
    });
});
