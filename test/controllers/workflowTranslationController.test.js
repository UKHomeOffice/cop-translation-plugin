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
                data: JSON.stringify({
                  field1: "foo",
                  field2: "bar",
                }),
                formId: "myFormId", 
              })
              .reply(200);
            nock('http://localhost:8000', {})
              .log(console.log)
              .get('/form/myFormId?full=true')
              .reply(200, forms.userDetailsContextForm);
            const request = httpMocks.createRequest({
                method: 'POST',
                url: '/api/translation/workflow/tasks/myTaskId/form/_complete',
                body: {
                  formId: "myFormId", 
                  data: JSON.stringify({
                    field1: "foo",
                    field2: "bar"
                  }),
                },
                params: {
                  taskId: "myTaskId"
                },
                kauth: keycloak
            });
            const response = await workflowTranslatorController.completeTask(request);
          
            expect(response.status).to.equal(200);
        });
        it('should encrypt sensitive fields', async () => {
          nock('http://localhost:9000', {})
              .log(console.log)
              .post('/api/workflow/tasks/myTaskId/form/_complete', body => {
                const data = JSON.parse(body.data);
                try {
                  expect(data.lastName).to.equal('foo');
                  expect(data.firstName).to.match(/.*==/);
                  return true;
                } catch (err) {
                  console.log(`error in encryption ${err.message}`, err);
                  return false;
                }
              })
              .reply(200);
            nock('http://localhost:8000', {})
              .log(console.log)
              .get('/form/myFormId?full=true')
              .reply(200, forms.formWithSensitiveField);
            const request = httpMocks.createRequest({
                method: 'POST',
                url: '/api/translation/workflow/tasks/myTaskId/form/_complete',
                body: {
                  formId: "myFormId", 
                  data: JSON.stringify({
                    lastName: "foo",
                    firstName: "bar"
                  }),
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
                data: JSON.stringify({
                  field1: "foo",
                  field2: "bar",
                }),
                formId: "myFormId",
              })
              .reply(400);
            nock('http://localhost:8000', {})
              .log(console.log)
              .get('/form/myFormId?full=true')
              .reply(200, forms.userDetailsContextForm);
            const request = httpMocks.createRequest({
                method: 'POST',
                url: '/api/translation/workflow/tasks/myTaskId/form/_complete',
                body: {
                  data: JSON.stringify({
                    field1: "foo",
                    field2: "bar"
                  }),
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
    describe('starting processes', () => {
        it('should start the process with the form data', async () => {
            nock('http://localhost:9000', {})
              .log(console.log)
              .matchHeader("authorization", "Bearer test-token")
              .post('/api/workflow/process-instances', {
                data: JSON.stringify({
                  field1: "foo",
                  field2: "bar",
                }),
                processKey: "myProcessName",
                variableName: "myVariableName",
                formId: "myFormId",
              })
              .reply(200, {
                success: true
              });
            nock('http://localhost:8000', {})
              .log(console.log)
              .get('/form/myFormId?full=true')
              .reply(200, forms.userDetailsContextForm);
            const request = httpMocks.createRequest({
                method: 'POST',
                url: '/api/translation/workflow/process-instances',
                body: {
                  data: JSON.stringify({
                    field1: "foo",
                    field2: "bar"
                  }),
                  processKey: "myProcessName",
                  variableName: "myVariableName",
                  formId: "myFormId",
                },
                kauth: keycloak
            });
            const response = await workflowTranslatorController.startProcessInstance(request);
          
            expect(response.status).to.equal(200);
            expect(response.data.success).to.be.true;
        });
        it('should add encryptionMetaData', async () => {
            nock('http://localhost:9000', {})
              .log(console.log)
              .post('/api/workflow/process-instances', body => {
                  const data = JSON.parse(body.data);
                  try {
                    expect(data._encryptionMetaData.iv).to.match(/.*==/);
                    expect(data._encryptionMetaData.publicKey).to.not.be.null;
                    return true;
                  } catch (err) {
                    console.log(`error in encryption ${err.message}`, err);
                    return false;
                  }
              })
              .reply(200, {
                success: true
              });
            nock('http://localhost:8000', {})
              .log(console.log)
              .get('/form/myFormId?full=true')
              .reply(200, forms.userDetailsContextForm);
            const request = httpMocks.createRequest({
                method: 'POST',
                url: '/api/translation/workflow/process-instances',
                body: {
                  data: JSON.stringify({
                    field1: "foo",
                    field2: "bar",
                    businessKey: "myProcessId",
                  }),
                  processKey: "myProcessName",
                  variableName: "myVariableName",
                  formId: "myFormId",
                },
                kauth: keycloak
            });
            const response = await workflowTranslatorController.startProcessInstance(request);

            expect(response.status).to.equal(200);
            expect(response.data.success).to.be.true;
        });
        it('should encrypt sensitive fields', async () => {
            nock('http://localhost:9000', {})
              .log(console.log)
              .post('/api/workflow/process-instances', body => {
                const data = JSON.parse(body.data);
                try {
                  expect(data.lastName).to.equal('foo');
                  expect(data.firstName).to.match(/.*==/);
                  return true;
                } catch (err) {
                  console.log(`error in encryption ${err.message}`, err);
                  return false;
                }
              })
              .reply(200, {
                success: true
              });
            nock('http://localhost:8000', {})
              .log(console.log)
              .get('/form/myFormId?full=true')
              .reply(200, forms.formWithSensitiveField);
            const request = httpMocks.createRequest({
                method: 'POST',
                url: '/api/translation/workflow/process-instances',
                body: {
                  data: JSON.stringify({
                    lastName: "foo",
                    firstName: "bar"
                  }),
                  processKey: "myProcessName",
                  variableName: "myVariableName",
                  formId: "myFormId",
                },
                kauth: keycloak
            });
            const response = await workflowTranslatorController.startProcessInstance(request);
          
            expect(response.status).to.equal(200);
            expect(response.data.success).to.be.true;
        });
        it('should pass back a 40x status', async () => {
          nock('http://localhost:9000', {})
              .log(console.log)
              .matchHeader("authorization", "Bearer test-token")
              .post('/api/workflow/process-instances', {
                data: JSON.stringify({
                  field1: "foo",
                  field2: "bar",
                }),
                processKey: "myProcessName",
                variableName: "myVariableName",
                formId: "myFormId",
              })
              .reply(400, {});
            nock('http://localhost:8000', {})
              .log(console.log)
              .get('/form/myFormId?full=true')
              .reply(200, forms.userDetailsContextForm);
            const request = httpMocks.createRequest({
                method: 'POST',
                url: '/api/translation/workflow/process-instances',
                body: {
                  data: JSON.stringify({
                    field1: "foo",
                    field2: "bar"
                  }),
                  processKey: "myProcessName",
                  variableName: "myVariableName",
                  formId: "myFormId",
                },
                params: {
                  taskId: "myTaskId"
                },
                kauth: keycloak
            });
            const response = await workflowTranslatorController.startProcessInstance(request);
          
            expect(response.status).to.equal(400);
        });
    });
});
