import JSONPath from "jsonpath";

process.env.NODE_ENV = 'test';
process.env.FORM_URL = 'http://localhost:8000';

import nock from 'nock';
import httpMocks from 'node-mocks-http';
import * as logger from 'winston';
import expect from 'expect';

import formDataController from '../src/controllers/formDataResolveController';

const forms = [{
    components: [
        {
            type: 'textfield',
            key: 'firstName',
            label: 'First Name',
            placeholder: 'Enter your first name.',
            defaultValue: '$.keycloakContext.givenName',
            input: true
        },
        {
            type: 'textfield',
            key: 'lastName',
            label: 'Last Name',
            placeholder: 'Enter your last name',
            defaultValue: '$.keycloakContext.familyName',
            input: true
        },
        {
            type: 'hidden',
            key: 'sessionId',
            label: 'sessionid',
            defaultValue: '$.keycloakContext.sessionId',
            input: true
        },
        {
            type: 'button',
            action: 'submit',
            label: 'Submit',
            theme: 'primary'
        }
    ]
}];

describe('Form Data Resolve Controller', () => {

    beforeEach(() => {
        nock('http://localhost:8000')
            .get('/form?name=testForm')
            .reply(200, forms);
    });

    describe('A call to data resolve controller', () => {
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

                const firstName = JSONPath.query(updatedForm, "$..components[?(@.key=='firstName')].defaultValue")[0][0];
                const lastName = JSONPath.query(updatedForm, "$..components[?(@.key=='lastName')].defaultValue")[0][0];
                const sessionId = JSONPath.query(updatedForm, "$..components[?(@.key=='sessionId')].defaultValue")[0][0];

                expect(firstName).toEqual("testgivenname");
                expect(lastName).toEqual("testfamilyname");
                expect(sessionId).toEqual("session_id");
                done();
            });
        });
    });
});