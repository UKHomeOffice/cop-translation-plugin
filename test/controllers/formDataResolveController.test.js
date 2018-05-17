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

    describe('A call to data resolve controller for input type', () => {
        beforeEach(() => {
            nock('http://localhost:8000')
                .get('/form?name=testForm')
                .reply(200, forms.simpleForm);
            nock('http://localhost:9001')
                .get('/staffview?email=eq.email')
                .reply(200, []);
        });
        it('it should return an updated form schema for keycloakContext', (done) => {
            const request = httpMocks.createRequest({
                method: 'GET',
                url: '/api/translation/form/testFrom',
                params: {
                    formName: "testForm"
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

            formDataController.getFormSchema(request, response);
            response.on('end', () => {
                expect(response.statusCode).toEqual(200);
                expect(response._isEndCalled()).toBe(true);
                const updatedForm = JSON.parse(response._getData());

                const firstName = JSONPath.value(updatedForm, "$..components[?(@.key=='firstName')].defaultValue");
                const lastName = JSONPath.value(updatedForm, "$..components[?(@.key=='lastName')].defaultValue");
                const sessionId = JSONPath.value(updatedForm, "$..components[?(@.key=='sessionId')].defaultValue");

                expect(firstName).toEqual("testgivenname");
                expect(lastName).toEqual("testfamilyname");
                expect(sessionId).toEqual("session_id");
                done();
            });
        });
    });

    describe('A call to data resolve controller for url type', () => {
        beforeEach(() => {
            nock('http://localhost:8000')
                .log(console.log)
                .get('/form?name=dataUrlForm')
                .reply(200, forms.dataUrlForm);
            nock('http://localhost:9001')
                .get('/staffview?email=eq.email')
                .reply(200, []);

        });
        it('it should return an updated form schema for url', (done) => {
            const request = httpMocks.createRequest({
                method: 'GET',
                url: '/api/translation/form/dataUrlForm',
                params: {
                    formName: "dataUrlForm"
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

            formDataController.getFormSchema(request, response);
            response.on('end', () => {
                expect(response.statusCode).toEqual(200);
                expect(response._isEndCalled()).toBe(true);
                const updatedForm = JSON.parse(response._getData());
                const url = JSONPath.value(updatedForm, "$..components[?(@.key=='regionid')].data.url");
                expect(url).toEqual("http://localhost:9001/region");
                done();
            });
        });
    });

});