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
            nock('http://localhost:8000', {
                reqheaders: {
                    nginxId: 'CorrelationId'
                }
            })
                .log(console.log)
                .get('/form?name=userDetailsContextForm')
                .reply(200, forms.userDetailsContextForm);
            nock('http://localhost:9001', {
                reqheaders: {
                    nginxId: 'CorrelationId'
                }
            })
                .log(console.log)
                .post('/api/platform-data/rpc/staffdetails', {
                    "argstaffemail": "noEmail"
                })
                .reply(200, []);
            nock('http://localhost:9001')
                .get('/api/platform-data/shift?email=eq.noEmail')
                .reply(200, []);
        });
           describe('A call to data resolve controller for process variables context', () => {
        beforeEach(() => {
            nock('http://localhost:8000', tracingHeader)
                .get('/form?name=processContextForm')
                .reply(200, forms.processContextForm);
            nock('http://localhost:9000', tracingHeader)
                .get('/api/workflow/tasks/taskId')
                .reply(200, tasks.taskData);
            nock('http://localhost:9000', tracingHeader)
                .get('/api/workflow/tasks/taskId/variables')
                .reply(200, tasks.taskVariables);
            nock('http://localhost:9000', tracingHeader)
                .get('/api/workflow/process-instances/processInstanceId/variables')
                .reply(200, tasks.processVariables);

            nock('http://localhost:9001', tracingHeader)
                .post('/api/platform-data/rpc/staffdetails', {
                    "argstaffemail": "email"
                })
                .reply(200, []);
            nock('http://localhost:9001', tracingHeader)
                .get('/api/platform-data/shift?email=eq.email')
                .reply(200, []);


        });
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
