import JSONPath from "jsonpath";
import nock from 'nock';
import httpMocks from 'node-mocks-http';
import * as forms from '../forms'
import {expect, formTranslateController} from '../setUpTests'
import sinon from "sinon";

describe('Form Data Resolve Controller With Business Key', () => {
    const marchEpochTime = Math.round(new Date(2019, 7, 12).getTime());
    const clock = sinon.useFakeTimers();
    clock.tick(marchEpochTime);

    it.only('it returns form with a newBusinessKey label and api of businessKey', async () => {
        nock('http://localhost:8000')
            .get('/form?name=testForm')
            .reply(200, forms.simpleForm);
        nock('http://localhost:9001')
            .post('/v1/rpc/staffdetails', {
                "argstaffemail": "email"
            }).reply(200, []);
        nock('http://localhost:9001')
            .get('/v1/shift?email=eq.email')
            .reply(200, []);
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

        const response = await formTranslateController.getForm(request);
        const businessKey = JSONPath.value(response, "$..components[?(@.key=='businessKey')].defaultValue");

        expect(businessKey).to.equal("BF-190812-1");
    });

    it('it returns form without businessKey', async () => {
        nock('http://localhost:8000')
            .get('/form?name=simpleFormWithoutBusinessKey')
            .reply(200, forms.simpleFormWithoutBusinessKey);
        nock('http://localhost:9001')
            .post('/v1/rpc/staffdetails', {
                "argstaffemail": "email"
            }).reply(200, []);
        nock('http://localhost:9001')
            .get('/v1/shift?email=eq.email')
            .reply(200, []);
        const request = httpMocks.createRequest({
            method: 'GET',
            url: '/api/translation/form/simpleFormWithoutBusinessKey',
            params: {
                formName: "simpleFormWithoutBusinessKey"
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

        const response = await formTranslateController.getForm(request);
        const businessKey = JSONPath.value(response, "$..components[?(@.key=='businessKey')]");

        expect(businessKey).to.be.undefined;
    });
    it('it returns form without populating business key if defaultValue present', async () => {
        nock('http://localhost:8000')
            .get('/form?name=simpleFormBusinessKeyWithDefaultValue')
            .reply(200, forms.simpleFormBusinessKeyWithDefaultValue);
        nock('http://localhost:9001')
            .post('/v1/rpc/staffdetails', {
                "argstaffemail": "email"
            }).reply(200, []);
        nock('http://localhost:9001')
            .get('/v1/shift?email=eq.email')
            .reply(200, []);
        const request = httpMocks.createRequest({
            method: 'GET',
            url: '/api/translation/form/simpleFormBusinessKeyWithDefaultValue',
            params: {
                formName: "simpleFormBusinessKeyWithDefaultValue"
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

        const response = await formTranslateController.getForm(request);
        const businessKey = JSONPath.value(response, "$..components[?(@.key=='businessKey')].defaultValue");

        expect(businessKey).to.be.eq('test');
    });
});
