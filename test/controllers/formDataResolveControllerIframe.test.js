import JSONPath from 'jsonpath';
import nock from 'nock';
import httpMocks from 'node-mocks-http';
import * as forms from '../forms'
import {expect, formTranslateController} from '../setUpTests'

const image = 'image';

describe('Form Data Resolve Controller', () => {
    describe('A call to data resolve controller for iframe content', () => {
        beforeEach(() => {
            nock('http://localhost:8000')
                .get('/form?name=iframeForm')
                .reply(200, {
                    total : 1,
                    forms: forms.iframeForm
                });

            nock('http://localhost:9000')
                .get('/api/workflow/tasks/taskId/variables')
                .reply(200, {})
                .get('/api/workflow/process-instances/processInstanceId/variables')
                .reply(200, {
                    variable: {
                        type: 'Object',
                        value: `{"img": "${image}"}`,
                        valueInfo: {
                            objectTypeName: 'xxxx',
                            serializationDataFormat: 'application/json'
                        }
                    }
                })
                .get('/api/workflow/tasks/taskId')
                .reply(200, {});

            nock('http://localhost:9001')
                .get('/v1/shift?email=eq.email')
                .reply(200, [])
                .get('/v1/view_rolemembers?select=email&rolelabel=eq.bfint,&branchid=eq.undefined')
                .reply(200, [])
                .post('/v1/rpc/extendedstaffdetails', {
                    argstaffemail: 'email'
                })
                .reply(200, [{
                    linemanager_email: 'linemanager@homeoffice.gov.uk'
                }])
                .post('/v1/rpc/staffdetails', {
                    argstaffemail : 'email',
                    defaultteamid: '018d7442-4b4e-4ff3-acc6-f2d865a6e6ad'
                })
                .reply(200, [{
                    staffid: 'abc-123'
                }]);
        });

        it('it should resolve iframe content', async () => {
            const request = httpMocks.createRequest({
                method: 'GET',
                url: '/api/translation/form/iframeForm',
                params: {
                    formName: 'iframeForm'
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
            const img = JSONPath.value(response, "$..components[?(@.key=='content')].html");
            expect(img).to.equal(
                "<p>Iframe</p>\n\n<p><iframe src=\"http://localhost:9001/some?access_token=test-token\" style=\"height: 125px; width: 100px;\" /></p>\n");
        });
    });
});
