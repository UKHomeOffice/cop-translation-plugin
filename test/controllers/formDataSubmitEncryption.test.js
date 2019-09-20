import nock from 'nock';
import httpMocks from 'node-mocks-http';
import * as forms from '../forms'
import {expect, formTranslateController} from '../setUpTests'

describe('Form Data Controller', () => {
    describe('Submitting form data to formio', () => {
        it('should encrypt sensitive fields', async () => {
            nock('http://localhost:8000', {})
                .log(console.log)
                .post('/form/formId/submission', {
                    data: {
                        firstName: "X0bz6FVfHwEjwmUALK0j12jHZg==",
                        lastName: "bar",
                        encryptedFields: ["firstName"],
                        _encryptionMetaData: {
                            iv: "W25/yzadEQNeV7jnZ3dnbA==",
                            publicKey: "BI7a9g2LvU9b0RtK/Euk5ge0yG3ZeYBI1PAGCwfVTxd/XySj1Yt2ok0YVKRj2T5D2wkYv/7doNcT0KfYNvRzENENFPgpTyVSazNdaMJfd76S2XWPuxFiRv0VcruX13o2PiO2a6AFsBMrbfNstobkRv9hskPUGTCRoPYe+pES2LIg"
                        },
                        businessKey: "hardcodedBusinessKey",
                    }
                })
                .reply(200, forms.formWithSensitiveField[0]);
            nock('http://localhost:9000', {})
                .log(console.log)
                .post('/rest/camunda/process-definition/key/processKey/start')
                .reply(200, {
                    "links": [{
                        "method": "GET",
                        "href": "http://localhost:9000/rest/camunda/process-instance/anId",
                        "rel": "self"
                    }],
                    "id": "anId",
                    "definitionId": "aProcessDefinitionId",
                    "businessKey": "hardcodedBusinessKey",
                    "tenantId": null,
                    "ended": false,
                    "suspended": false
                });
            nock('http://localhost:8000', {})
                .log(console.log)
                .get('/form/formId?full=true')
                .reply(200, forms.formWithSensitiveField[0]);
            const request = httpMocks.createRequest({
                method: 'POST',
                url: '/api/translation/form/formId/submission',
                body: {
                    nonShiftApiCall: false,
                    processKey: 'processKey',
                    variableName: 'variableName',
                    data: {
                        firstName: "foo",
                        lastName: "bar",
                        businessKey: "hardcodedBusinessKey",
                    }
                },
                params: {
                    formId: "formId"
                },
                kauth: {
                    grant: {
                        access_token: {
                            token: "test-token",
                            content: {
                                session_state: "session_id",
                                email: "emailTest123",
                                preferred_username: "test",
                                given_name: "firstname",
                                family_name: "surname"
                            }
                        }

                    }
                }
            });
            const response = await formTranslateController.submitForm(request);
            expect(response).to.be.not.null;
        });
        it('should skip sensitive fields that are null', async () => {
            nock('http://localhost:8000', {})
                .log(console.log)
                .post('/form/formId/submission', {
                    data: {
                        firstName: null,
                        lastName: "bar"
                    }
                })
                .reply(200, forms.formWithSensitiveField[0]);
            nock('http://localhost:8000', {})
                .log(console.log)
                .get('/form/formId?full=true')
                .reply(200, forms.formWithSensitiveField[0]);
            nock('http://localhost:9000', {})
                .log(console.log)
                .post('/rest/camunda/process-definition/key/processKey/start')
                .reply(200, {
                    "links": [{
                        "method": "GET",
                        "href": "http://localhost:9000/rest/camunda/process-instance/anId",
                        "rel": "self"
                    }],
                    "id": "anId",
                    "definitionId": "aProcessDefinitionId",
                    "businessKey": "hardcodedBusinessKey",
                    "tenantId": null,
                    "ended": false,
                    "suspended": false
                });
            const request = httpMocks.createRequest({
                method: 'POST',
                url: '/api/translation/form/formId/submission',
                body: {
                    nonShiftApiCall: false,
                    processKey: 'processKey',
                    variableName: 'variableName',
                    data: {
                        firstName: null,
                        lastName: "bar"
                    }
                },
                params: {
                    formId: "formId"
                },
                kauth: {
                    grant: {
                        access_token: {
                            token: "test-token",
                            content: {
                                session_state: "session_id",
                                email: "emailTest123",
                                preferred_username: "test",
                                given_name: "firstname",
                                family_name: "surname"
                            }
                        }

                    }
                }
            });
            const response = await formTranslateController.submitForm(request);
            expect(response).to.be.not.null;
        });
    });
});
