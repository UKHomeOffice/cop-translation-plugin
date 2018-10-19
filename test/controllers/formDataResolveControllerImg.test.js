import * as tasks from "../task";

process.env.NODE_ENV = 'test';
process.env.FORM_URL = 'http://localhost:8000';
process.env.WORKFLOW_URL = 'http://localhost:9000';
process.env.PLATFORM_DATA_URL = 'http://localhost:9001';


import JSONPath from "jsonpath";
import nock from 'nock';
import httpMocks from 'node-mocks-http';
import expect from 'expect';
import formDataController from '../../src/controllers/formDataResolveController';
import * as forms from '../forms'



const image = "image";
describe('Form Data Resolve Controller', () => {

    describe('A call to data resolve controller for img', () => {
        beforeEach(() => {
            nock('http://localhost:8000')
                .get('/form?name=imgForm')
                .reply(200, forms.imgForm);
            nock('http://localhost:9001')
                .get('/api/platform-data/staffview?email=eq.email')
                .reply(200, []);
            nock('http://localhost:9000')
                .get('/api/workflow/tasks/taskId/variables')
                .reply(200, {});
            nock('http://localhost:9000')
                .get('/api/workflow/process-instances/processInstanceId/variables')
                .reply(200, {
                    variable: {
                        type: "Object",
                        value: `{\"img\": \"${image}\"}`,
                        valueInfo: {
                            objectTypeName: "xxxx",
                            serializationDataFormat: "application/json"
                        }
                    }
                });

            nock('http://localhost:9001')
                .get('/api/platform-data/shift?email=eq.email')
                .reply(200, []);
        });
        it('it should base64encode image source', (done) => {
            const request = httpMocks.createRequest({
                method: 'GET',
                url: '/api/translation/form/imgForm',
                params: {
                    formName: "imgForm"
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

                const img = JSONPath.value(updatedForm, "$..components[?(@.key=='content')].html");
                expect(img).toEqual(
                "<p>Image</p>\n\n<p><img src=\"data:image/png;base64,image\" style=\"height: 125px; width: 100px;\" /></p>\n");
                done();
            });
        });
    });

});