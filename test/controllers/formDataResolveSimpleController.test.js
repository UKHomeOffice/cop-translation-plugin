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

    describe('A call to data resolve controller with simple form', () => {
        beforeEach(() => {
            nock('http://localhost:8000')
                .get('/form?name=noContextData')
                .reply(200, forms.noContextData);
            nock('http://localhost:9001')
                .get('/test/public/staffattributes?_join=inner:person:staffattributes.personid:$eq:person.personid&staffattributes.email=email')
                .reply(200, []);
        });
        it('it should return form without any data resolution', (done) => {
            const request = httpMocks.createRequest({
                method: 'GET',
                url: '/api/translation/form',
                params: {
                    formName: "noContextData"
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

                expect(firstName).toEqual("Test");
                expect(lastName).toEqual("Test");
                done();
            });
        });
    });

});