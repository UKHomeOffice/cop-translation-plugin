import JSONPath from "jsonpath";
import nock from 'nock';
import httpMocks from 'node-mocks-http';
import * as forms from '../forms'
import {expect, formTranslateController} from '../setUpTests'

describe('Form Data Controller', () => {
    describe('Submitting form data to formio', () => {
        it('should submit form data to formio', async () => {
          nock('http://localhost:8000', {})
              .log(console.log)
              .post('/form/formId/submission', {
                data: {
                  field1: "foo",
                  field2: "bar"
                }
              })
              .reply(200, forms.userDetailsContextForm);
          nock('http://localhost:8000', {})
              .log(console.log)
              .get('/form/formId?full=true')
              .reply(200, forms.userDetailsContextForm[0]);
            const request = httpMocks.createRequest({
                method: 'POST',
                url: '/api/translation/form/formId/submission',
                body: {
                  data: {
                    field1: "foo",
                    field2: "bar"
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

            const grade = JSONPath.value(response, "$..components[?(@.key=='grade')].defaultValue");
            const personId = JSONPath.value(response, "$..components[?(@.key=='personid')].defaultValue");

            expect(response.status).to.equal(200);
            expect(grade).to.equal("{$.staffDetailsDataContext.gradeid}");
            expect(personId).to.equal("{$.staffDetailsDataContext.staffid}");
        });
        it('should return 400 if 400 received from formio and pass the response back', async () => {
            nock('http://localhost:8000', {})
              .log(console.log)
              .post('/form/formId/submission', {
                data: {
                  field1: "foo",
                  field2: "bar"
                }
              })
              .reply(400, forms.userDetailsContextForm);
            nock('http://localhost:8000', {})
              .log(console.log)
              .get('/form/formId?full=true')
              .reply(200, forms.userDetailsContextForm[0]);
            const request = httpMocks.createRequest({
                method: 'POST',
                url: '/api/translation/form/formId/submission',
                body: {
                  data: {
                    field1: "foo",
                    field2: "bar"
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
            const grade = JSONPath.value(response, "$..components[?(@.key=='grade')].defaultValue");
            const personId = JSONPath.value(response, "$..components[?(@.key=='personid')].defaultValue");

            expect(response.status).to.equal(400);
            expect(grade).to.equal("{$.staffDetailsDataContext.gradeid}");
            expect(personId).to.equal("{$.staffDetailsDataContext.staffid}");
      });
      it('should throw exception if 500 received from formio', async () => {
            nock('http://localhost:8000', {})
              .log(console.log)
              .post('/form/formId/submission', {
                data: {
                  field1: "foo",
                  field2: "bar"
                }
              })
              .reply(500);
            nock('http://localhost:8000', {})
              .log(console.log)
              .get('/form/formId?full=true')
              .reply(200, forms.userDetailsContextForm[0]);
            const request = httpMocks.createRequest({
                method: 'POST',
                url: '/api/translation/form/formId/submission',
                body: {
                  data: {
                    field1: "foo",
                    field2: "bar"
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
            try {
              await formTranslateController.submitForm(request);
              return Promise.reject("Shouldn't get here");
            } catch (err) {
              // expected
            }
        });
      });
      it('should throw exception if form can not be loaded', async () => {
            nock('http://localhost:8000', {})
              .log(console.log)
              .get('/form/formId?full=true')
              .reply(404);
            const request = httpMocks.createRequest({
                method: 'POST',
                url: '/api/translation/form/formId/submission',
                body: {
                  data: {
                    field1: "foo",
                    field2: "bar"
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
            try {
              await formTranslateController.submitForm(request);
              return Promise.reject("Shouldn't get here");
            } catch (err) {
              // expected
            }
        });
});
