import JSONPath from "jsonpath";
import nock from 'nock';
import httpMocks from 'node-mocks-http';
import * as forms from '../forms'
import {expect, formTranslateController} from '../setUpTests'

describe('Form Data Resolve Controller', () => {
    describe('A call to data resolve controller for user details  context', () => {
        beforeEach(() => {
            nock('http://localhost:8000')
                .get('/form?name=userDetailsContextForm')
                .reply(200, forms.userDetailsContextForm);
            nock('http://localhost:9001')
                .post('/rpc/staffdetails', {'argstaffemail' : 'emailTest123'})
                .reply(200,

                    [
                        {
                            "phone": "phone",
                            "email": "emailTest123",
                            "gradetypeid": "gradetypeid",
                            "firstname": "firstname",
                            "surname": "surname",
                            "qualificationtypes": [
                                {
                                    "qualificationname": "dummy",
                                    "qualificationtype": "1"
                                },
                                {
                                    "qualificationname": "staff",
                                    "qualificationtype": "2"
                                }
                            ],
                            "staffid": "staffid",
                            "gradename": "grade"
                        }
                    ]);

            nock('http://localhost:9001')
                .get('/shift?email=eq.emailTest123')
                .reply(200, []);
        });
        it('it should return an updated form schema for user details context', async () => {
            const request = httpMocks.createRequest({
                method: 'GET',
                url: '/api/translation/form/userDetailsContextForm',
                params: {
                    formName: "userDetailsContextForm"
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
            const response = await formTranslateController.getForm(request);

            const grade = JSONPath.value(response, "$..components[?(@.key=='grade')].defaultValue");
            const personId = JSONPath.value(response, "$..components[?(@.key=='personid')].defaultValue");

            expect(grade).to.equal("gradetypeid");
            expect(personId).to.equal("staffid");
        });
    });

    describe('A call to data resolve controller for with details for user context', () => {
        beforeEach(() => {
            nock('http://localhost:8000')
                .log(console.log)
                .get('/form?name=userDetailsContextForm')
                .reply(200, forms.userDetailsContextForm);
            nock('http://localhost:9001')
                .log(console.log)
                .post('/rpc/staffdetails', {
                    "argstaffemail" : "noEmail"
                })
                .reply(200, []);
            nock('http://localhost:9001')
                .get('/shift?email=eq.noEmail')
                .reply(200, []);
        });
        it('it should return an updated form schema with null values', async () => {
            const request = httpMocks.createRequest({
                method: 'GET',
                url: '/api/translation/form/userDetailsContextForm',
                params: {
                    formName: "userDetailsContextForm"
                },
                kauth: {
                    grant: {
                        access_token: {
                            token: "test-token",
                            content: {
                                session_state: "session_id",
                                email: "noEmail",
                                preferred_username: "test",
                                given_name: "testgivenname",
                                family_name: "testfamilyname"
                            }
                        }

                    }
                }
            });
            const response = await formTranslateController.getForm(request);

            const grade = JSONPath.value(response, "$..components[?(@.key=='grade')].defaultValue");

            expect(grade).to.equal(null);
        });
    });
});
