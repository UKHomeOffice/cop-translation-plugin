import JSONPath from "jsonpath";
import nock from 'nock';
import httpMocks from 'node-mocks-http';
import * as forms from '../forms'

import {expect, formTranslateController} from '../setUpTests'


describe('Form Data Resolve Controller', () => {

    describe('A call to data resolve controller custom context', () => {
        beforeEach(() => {
            nock('http://localhost:8000')
                .get('/form?name=customContextForm')
                .reply(200, forms.customContextForm);
            nock('http://localhost:9001')
                .post('/rpc/staffdetails', {
                    "argstaffemail": "email"
                })
                .reply(200, []);
            nock('http://localhost:9001')
                .get('/shift?email=eq.email')
                .reply(200, []);
        });
        it('it should return an updated form schema for custom context', async () => {
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

            const response = await formTranslateController.getFormWithContext(request);

            const firstName = JSONPath.value(response, "$..components[?(@.key=='firstName')].defaultValue");
            const lastName = JSONPath.value(response, "$..components[?(@.key=='lastName')].defaultValue");

            expect(firstName).to.equal("customFirstName");
            expect(lastName).to.equal("customLastName");

        });
    });

    describe('A call to data resolve controller returns 404 if form does not exist', () => {
        beforeEach(() => {
            nock('http://localhost:8000')
                .get('/form?name=randomForm')
                .reply(200, []);
            nock('http://localhost:9001')
                .post('/rpc/staffdetails', {
                    "argstaffemail": "email"
                })
                .reply(200, []);
            nock('http://localhost:9001')
                .get('/shift?email=eq.email')
                .reply(200, []);
        });
        it('it should return 404 status', async () => {
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
            await expect(formTranslateController.getFormWithContext(request)).to.eventually.be.rejectedWith('Form randomForm could not be found');
        });
    });

});
