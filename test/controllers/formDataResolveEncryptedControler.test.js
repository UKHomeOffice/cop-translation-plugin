import JSONPath from "jsonpath";
import nock from 'nock';
import httpMocks from 'node-mocks-http';
import * as forms from '../forms'
import * as tasks from '../task'
import {expect, formTranslateController} from '../setUpTests'

describe('Form Data Resolve Controller', () => {

    describe('A call to data resolve controller with simple form', () => {
        beforeEach(() => {
            nock('http://localhost:8000')
                .get('/form?name=taskContextForm')
                .reply(200, {
                    total: 1,
                    forms: forms.taskContextForm
                });
            nock('http://localhost:9001')
                .post('/v1/rpc/staffdetails', {
                    "argstaffemail" : "email"
                })
                .reply(200, []);
            nock('http://localhost:9001')
                .get('/v1/shift?email=eq.email')
                .reply(200, []);
            nock('http://localhost:9000')
                .get('/api/workflow/tasks/taskId')
                .reply(200, tasks.taskData);
            nock('http://localhost:9000')
                .get('/api/workflow/tasks/taskId/variables')
                .reply(200, tasks.taskVariables);
            nock('http://localhost:9000')
                .get('/api/workflow/process-instances/processInstanceId/variables')
                .reply(200, tasks.processVariablesWithEncryptedValues);
        });
        it('should return form with encrypted data decrypted', async () => {
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
            const response = await formTranslateController.getForm(request);

            const firstName = JSONPath.value(response, "$..components[?(@.key=='firstName')].defaultValue");
            const lastName = JSONPath.value(response, "$..components[?(@.key=='lastName')].defaultValue");

            expect(firstName).to.equal("baz");
            expect(lastName).to.equal("lastNameFromProcess");

        });
    });

});
