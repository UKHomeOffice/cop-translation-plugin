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

    beforeEach(() => {
        nock('http://localhost:9001')
            .post('/v1/rpc/staffdetails', {
                argstaffemail: "email"
            })
            .reply(200, [{
                staffid: 'abc-123',
                defaultteamid: '018d7442-4b4e-4ff3-acc6-f2d865a6e6ad'
            }])
            .get('/v1/shift?email=eq.email')
            .reply(200, [])
            .post('/v1/rpc/extendedstaffdetails', {
                argstaffemail: 'email'
            })
            .reply(200, [{
                linemanager_email: 'linemanager@homeoffice.gov.uk'
            }])
            .get('/v1/entities/team')
            .reply(200, {
                data: [{
                    id: '018d7442-4b4e-4ff3-acc6-f2d865a6e6ad'
                }]
            })
            .get('/v2/view_rolemembers?filter=rolelabel=eq.bfint')
            .reply(200, [{
                email: 'integritylead1@homeoffice.gov.uk',
                defaultteamid: '15a13c2a-fa63-4437-b4b0-d6b070e9c17e',
            }]);
    });

    it('it returns form with a newBusinessKey label and api of businessKey', async () => {
        nock('http://localhost:8000')
            .get('/form?name=testForm')
            .reply(200, {
                total :1,
                forms: forms.simpleForm
            });

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

        expect(businessKey).to.equal("BF-20190812-1");
    });

    it('it returns form without businessKey', async () => {
        nock('http://localhost:8000')
            .get('/form?name=simpleFormWithoutBusinessKey')
            .reply(200, {
                total :1,
                forms: forms.simpleFormWithoutBusinessKey
            });

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
            .reply(200, {
                total : 1,
                forms: forms.simpleFormBusinessKeyWithDefaultValue
            });

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
