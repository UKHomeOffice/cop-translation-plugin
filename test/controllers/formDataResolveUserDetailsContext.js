process.env.NODE_ENV = 'test';
process.env.FORM_URL = 'http://localhost:8000';
process.env.WORKFLOW_URL = 'http://localhost:9000';
process.env.REFERENCE_DATA_URL = 'http://localhost:9001';
process.env.TX_DB_NAME = "test";



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
                .get('/api/reference-data/staffattributes?_join=inner:person:staffattributes.personid:$eq:person.personid&staffattributes.email=emailTest123')
                .reply(200,

                    [
                        {
                            "staffattributesid": 13,
                            "email": "email",
                            "grade": "test",
                            "securitycleared": false,
                            "securitycleareddate": null,
                            "personid": "personid",
                            "phone": "testphone",
                            "firstname": "first",
                            "lastname": "last"
                        }
                    ]);
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
                const personId = JSONPath.value(updatedForm, "$..components[?(@.key=='personid')].defaultValue");

                expect(grade).toEqual("test");
                expect(personId).toEqual("personid");

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
                .get('/api/reference-data/staffattributes?_join=inner:person:staffattributes.personid:$eq:person.personid&staffattributes.email=noEmail')
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