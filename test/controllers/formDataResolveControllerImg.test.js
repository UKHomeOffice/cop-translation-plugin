import JSONPath from 'jsonpath';
import nock from 'nock';
import httpMocks from 'node-mocks-http';
import * as forms from '../forms'
import {expect, formTranslateController} from '../setUpTests'

const image = 'image';

describe('Form Data Resolve Controller', () => {
    describe('A call to data resolve controller for img', () => {
        beforeEach(() => {
            nock('http://localhost:8000')
                .get('/form?name=imgForm')
                .reply(200, {
                    total :1,
                    forms: forms.imgForm
                })
                .get('/form?name=jpgImgForm')
                .reply(200, {
                    total :1,
                    forms: forms.jpgImgForm
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
                .post('/v1/rpc/extendedstaffdetails', {
                    argstaffemail: 'email'
                })
                .reply(200, [{
                    linemanager_email: 'linemanager@homeoffice.gov.uk'
                }])
                .post('/v1/rpc/staffdetails', {
                    argstaffemail : 'email'
                })
                .reply(200, [{
                    staffid: 'abc-123',
                    defaultteamid: '018d7442-4b4e-4ff3-acc6-f2d865a6e6ad'
                }])
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

        it('it should base64encode image source', async () => {
            const request = httpMocks.createRequest({
                method: 'GET',
                url: '/api/translation/form/imgForm',
                params: {
                    id: 'imgForm'
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
                "<p>Image</p>\n\n<p><img src=\"image\" style=\"height: 125px; width: 100px;\" /></p>\n");

        });
        it('it should jpg image source', async () => {
            const request = httpMocks.createRequest({
                method: 'GET',
                url: '/api/translation/form/jpgImgForm',
                params: {
                    id: 'jpgImgForm'
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
                "<p>Image</p>\n\n<p><img src=\"image\" style=\"height: 125px; width: 100px;\" /></p>\n");

        });
    });

});
