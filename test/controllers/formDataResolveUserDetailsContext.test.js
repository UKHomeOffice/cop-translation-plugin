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

describe('Form Data Resolve Controller', () => {
    describe('A call to data resolve controller for user details  context', () => {
        beforeEach(() => {
            nock('http://localhost:8000')
                .get('/form?name=userDetailsContextForm')
                .reply(200, forms.userDetailsContextForm);
            nock('http://localhost:9001')
                .get('/api/platform-data/staffview?email=eq.emailTest123')
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
                .get('/api/platform-data/shift?email=eq.emailTest123')
                .reply(200, []);
        });
        it('it should return an updated form schema for user details context', (done) => {
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
            const response = httpMocks.createResponse({
                eventEmitter: require('events').EventEmitter
            });

            formDataController.getFormSchema(request, response);
            response.on('end', () => {
                expect(response.statusCode).toEqual(200);
                expect(response._isEndCalled()).toBe(true);
                const updatedForm = JSON.parse(response._getData());

                const grade = JSONPath.value(updatedForm, "$..components[?(@.key=='grade')].defaultValue");
                const personId = JSONPath.value(updatedForm, "$..components[?(@.key=='personid')].defaultValue");

                expect(grade).toEqual("gradetypeid");
                expect(personId).toEqual("staffid");

                done();
            });
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
                .get('/api/platform-data/staffview?email=eq.noEmail')
                .reply(200, []);
            nock('http://localhost:9001')
                .get('/api/platform-data/shift?email=eq.noEmail')
                .reply(200, []);
        });
        it('it should return an updated form schema with null values', (done) => {
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
            const response = httpMocks.createResponse({
                eventEmitter: require('events').EventEmitter
            });

            formDataController.getFormSchema(request, response);
            response.on('end', () => {
                expect(response.statusCode).toEqual(200);
                expect(response._isEndCalled()).toBe(true);
                const updatedForm = JSON.parse(response._getData());
                const grade = JSONPath.value(updatedForm, "$..components[?(@.key=='grade')].defaultValue");

                expect(grade).toEqual(null);

                done();
            });
        });
    });
});