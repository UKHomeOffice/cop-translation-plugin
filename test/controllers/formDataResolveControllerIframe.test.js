import JSONPath from "jsonpath";
import nock from 'nock';
import httpMocks from 'node-mocks-http';
import * as forms from '../forms'
import {expect, formTranslateController} from '../setUpTests'


const image = "image";
describe('Form Data Resolve Controller', () => {

    describe('A call to data resolve controller for iframe content', () => {
        beforeEach(() => {
            nock('http://localhost:8000')
                .get('/form?name=iframeForm')
                .reply(200, forms.iframeForm);
            nock('http://localhost:9001')
                .post('/v1/rpc/staffdetails', {
                    "argstaffemail" : "email"
                })
                .reply(200, []);
            nock('http://localhost:9000')
                .get('/api/workflow/tasks/taskId/variables')
                .reply(200, {});
            nock('http://localhost:9000')
                .get('/api/workflow/process-instances/processInstanceId/variables')
                .reply(200, {
                    variable: {
                        type: "Object",
                        value: `{"img": "${image}"}`,
                        valueInfo: {
                            objectTypeName: "xxxx",
                            serializationDataFormat: "application/json"
                        }
                    }
                });
            nock('http://localhost:9000')
                .get('/api/workflow/tasks/taskId')
                .reply(200, {});

            nock('http://localhost:9001')
                .get('/v1/shift?email=eq.email')
                .reply(200, []);
        });
        it('it should resolve iframe content', async () => {
            const request = httpMocks.createRequest({
                method: 'GET',
                url: '/api/translation/form/iframeForm',
                params: {
                    formName: "iframeForm"
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
            const img = JSONPath.value(response, "$..components[?(@.key=='content')].html");
            expect(img).to.equal(
                "<p>Iframe</p>\n\n<p><iframe src=\"http://localhost:9001/some?access_token=test-token\" style=\"height: 125px; width: 100px;\" /></p>\n");

        });
    });

});
