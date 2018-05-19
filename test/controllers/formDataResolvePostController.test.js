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

    describe('A call to data resolve controller custom context', () => {
        beforeEach(() => {
            nock('http://localhost:8000')
                .get('/form?name=customContextForm')
                .reply(200, forms.customContextForm);
            nock('http://localhost:9001')
                .get('/api/platform-data/staffview?email=eq.email')
                .reply(200, []);
            nock('http://localhost:9001')
                .get('/api/platform-data/shift?email=eq.email')
                .reply(200, []);
        });
        it('it should return an updated form schema for custom context', (done) => {
            const request = httpMocks.createRequest({
                method: 'POST',
                url: '/api/translation/form',
                body: {
                    formName: 'customContextForm',
                    dataContext: {
                        givenName: "customFirstName",
                        myCustomObject: {
                            familyName: "customLastName"
                        }
                    }
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

            const formSchemaForContext = formDataController.getFormSchemaForContext(request, response);
            response.on('end', () => {
                expect(response.statusCode).toEqual(200);
                expect(response._isEndCalled()).toBe(true);
                const updatedForm = JSON.parse(response._getData());

                const firstName = JSONPath.value(updatedForm, "$..components[?(@.key=='firstName')].defaultValue");
                const lastName = JSONPath.value(updatedForm, "$..components[?(@.key=='lastName')].defaultValue");

                expect(firstName).toEqual("customFirstName");
                expect(lastName).toEqual("customLastName");
                done();
            });
        });
    });

    describe('A call to data resolve controller returns 404 if form does not exist', () => {
        beforeEach(() => {
            nock('http://localhost:8000')
                .get('/form?name=randomForm')
                .reply(200, []);
            nock('http://localhost:9001')
                .get('/api/platform-data/staffview?email=eq.email')
                .reply(200, []);
            nock('http://localhost:9001')
                .get('/api/platform-data/shift?email=eq.email')
                .reply(200, []);
        });
        it('it should return 404 status', (done) => {
            const request = httpMocks.createRequest({
                method: 'POST',
                url: '/api/translation/form',
                body: {
                    formName: 'randomForm',
                    dataContext: {
                        givenName: "customFirstName",
                        myCustomObject: {
                            familyName: "customLastName"
                        }
                    }
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

            formDataController.getFormSchemaForContext(request, response);
            response.on('end', () => {
                expect(response.statusCode).toEqual(404);
                expect(response._isEndCalled()).toBe(true);
                done();
            });
        });
    });

});