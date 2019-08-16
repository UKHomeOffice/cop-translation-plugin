import nock from 'nock';
import httpMocks from 'node-mocks-http';
import {expect, workflowTranslatorController} from '../setUpTests'

describe('Workflow Controller', () => {
    describe('completing tasks', () => {
        it('should complete the task with the form data', async () => {
          nock('http://localhost:9000', {})
              .log(console.log)
              .post('/api/workflow/tasks/myTaskId/form/_complete', {
                data: {
                  field1: "foo",
                  field2: "bar"
                },
              })
              .reply(200);
            const request = httpMocks.createRequest({
                method: 'POST',
                url: '/api/translation/workflow/tasks/myTaskId/form/_complete',
                body: {
                  data: {
                    field1: "foo",
                    field2: "bar"
                  },
                },
                params: {
                  taskId: "myTaskId"
                }
            });
            const response = await workflowTranslatorController.completeTask(request);
          
            expect(response.status).to.equal(200);
        });
        it('should pass back a 40x status', async () => {
          nock('http://localhost:9000', {})
              .log(console.log)
              .post('/api/workflow/tasks/myTaskId/form/_complete', {
                data: {
                  field1: "foo",
                  field2: "bar"
                },
              })
              .reply(400);
            const request = httpMocks.createRequest({
                method: 'POST',
                url: '/api/translation/workflow/tasks/myTaskId/form/_complete',
                body: {
                  data: {
                    field1: "foo",
                    field2: "bar"
                  },
                },
                params: {
                  taskId: "myTaskId"
                }
            });
            const response = await workflowTranslatorController.completeTask(request);
          
            expect(response.status).to.equal(400);
        });
    });
    describe('starting processes', () => {
        it('should start the process with the form data', async () => {
          nock('http://localhost:9000', {})
              .log(console.log)
              .post('/api/workflow/process-instances', {
                data: {
                  field1: "foo",
                  field2: "bar"
                },
                processKey: "myProcessName",
                variableName: "myVariableName",
              })
              .reply(200, {
                success: true
              });
            const request = httpMocks.createRequest({
                method: 'POST',
                url: '/api/translation/workflow/process-instances',
                body: {
                  data: {
                    field1: "foo",
                    field2: "bar"
                  },
                  processKey: "myProcessName",
                  variableName: "myVariableName",
                },
            });
            const response = await workflowTranslatorController.startProcessInstance(request);
          
            expect(response.status).to.equal(200);
            expect(response.data.success).to.be.true;
        });
        it('should pass back a 40x status', async () => {
          nock('http://localhost:9000', {})
              .log(console.log)
              .post('/api/workflow/process-instances', {
                data: {
                  field1: "foo",
                  field2: "bar"
                },
                processKey: "myProcessName",
                variableName: "myVariableName",
              })
              .reply(400, {});
            const request = httpMocks.createRequest({
                method: 'POST',
                url: '/api/translation/workflow/process-instances',
                body: {
                  data: {
                    field1: "foo",
                    field2: "bar"
                  },
                  processKey: "myProcessName",
                  variableName: "myVariableName",
                },
                params: {
                  taskId: "myTaskId"
                }
            });
            const response = await workflowTranslatorController.startProcessInstance(request);
          
            expect(response.status).to.equal(400);
        });
    });
});
