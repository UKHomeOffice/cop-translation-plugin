import JSONPath from "jsonpath";
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
                  firstName: /.*==/,
                  lastName: "bar"
                }
              })
              .reply(200, forms.formWithSensitiveField);
          nock('http://localhost:8000', {})
              .log(console.log)
              .get('/form/formId?full=true')
              .reply(200, forms.formWithSensitiveField);
            const request = httpMocks.createRequest({
                method: 'POST',
                url: '/api/translation/form/formId/submission',
                body: {
                  data: {
                    firstName: "foo",
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

            expect(response.status).to.equal(200);
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
              .reply(200, forms.formWithSensitiveField);
          nock('http://localhost:8000', {})
              .log(console.log)
              .get('/form/formId?full=true')
              .reply(200, forms.formWithSensitiveField);
            const request = httpMocks.createRequest({
                method: 'POST',
                url: '/api/translation/form/formId/submission',
                body: {
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

            expect(response.status).to.equal(200);
        });
    });
});
