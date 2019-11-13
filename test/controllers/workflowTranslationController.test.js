import nock from 'nock';
import httpMocks from 'node-mocks-http';
import * as forms from '../forms'
import {expect, workflowTranslatorController} from '../setUpTests'

const keycloak = {
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
                };

describe('Workflow Controller', () => {
    describe('completing tasks', () => {
        it('should complete the task with the form data', async () => {
          nock('http://localhost:9000', {})
              .log(console.log)
              .matchHeader("authorization", "Bearer test-token")
              .post('/api/workflow/tasks/myTaskId/form/_complete', {
                variables: {
                    myForm: {
                        type: "json",
                        value: JSON.stringify({
                          field1: "foo",
                          field2: "bar",
                        }),
                        valueInfo: {}
                    }
                },
                formId: "myFormId",
              })
              .reply(200);
            nock('http://localhost:8000', {})
              .log(console.log)
              .get('/form/myFormId')
              .reply(200, forms.userDetailsContextForm[0]);
            const request = httpMocks.createRequest({
                method: 'POST',
                url: '/api/translation/workflow/tasks/myTaskId/form/_complete',
                body: {
                  variables: {
                      myForm: {
                          type: "json",
                          value: JSON.stringify({
                            field1: "foo",
                            field2: "bar",
                          }),
                          valueInfo: {}
                      }
                  },
                  formId: "myFormId",
                },
                params: {
                  taskId: "myTaskId"
                },
                kauth: keycloak
            });
            const response = await workflowTranslatorController.completeTask(request);

            expect(response.status).to.equal(200);
        });
        it('should pass back a 40x status', async () => {
          nock('http://localhost:9000', {})
              .log(console.log)
              .matchHeader("authorization", "Bearer test-token")
              .post('/api/workflow/tasks/myTaskId/form/_complete', {
                variables: {
                    myForm: {
                        type: "json",
                        value: JSON.stringify({
                          field1: "foo",
                          field2: "bar",
                        }),
                        valueInfo: {}
                    }
                },
                formId: "myFormId",
              })
              .reply(400);
            nock('http://localhost:8000', {})
              .log(console.log)
              .get('/form/myFormId')
              .reply(200, forms.userDetailsContextForm[0]);
            const request = httpMocks.createRequest({
                method: 'POST',
                url: '/api/translation/workflow/tasks/myTaskId/form/_complete',
                body: {
                  variables: {
                      myForm: {
                          type: "json",
                          value: JSON.stringify({
                            field1: "foo",
                            field2: "bar",
                          }),
                          valueInfo: {}
                      }
                  },
                  formId: "myFormId",
                },
                params: {
                  taskId: "myTaskId"
                },
                kauth: keycloak
            });
            const response = await workflowTranslatorController.completeTask(request);

            expect(response.status).to.equal(400);
        });
    });
});
