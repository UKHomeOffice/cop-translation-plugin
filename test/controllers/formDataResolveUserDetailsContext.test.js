import JSONPath from 'jsonpath';
import nock from 'nock';
import httpMocks from 'node-mocks-http';
import * as forms from '../forms'
import {expect, formTranslateController} from '../setUpTests'

describe('Form Data Resolve Controller', () => {
    beforeEach(() => {
        nock('http://localhost:8000')
            .get('/form?name=userDetailsContextForm')
            .reply(200, {
                total: 1,
                forms: forms.userDetailsContextForm
            });

        nock('http://localhost:9001')
            .post('/v1/rpc/staffdetails', {'argstaffemail' : 'staffmember@homeoffice.gov.uk'})
            .reply(200, [{
                phone: 'phone',
                email: 'staffmember@homeoffice.gov.uk',
                gradeid: 'gradeid',
                firstname: 'firstname',
                surname: 'surname',
                qualificationtypes: [
                    {
                        qualificationname: 'dummy',
                        qualificationtype: '1'
                    },
                    {
                        qualificationname: 'staff',
                        qualificationtype: '2'
                    }
                ],
                staffid: 'staffid',
                gradename: 'grade',
                defaultteamid: '018d7442-4b4e-4ff3-acc6-f2d865a6e6ad'
            }])
            .get('/v1/shift?email=eq.staffmember@homeoffice.gov.uk')
            .reply(200, [])
            .get('/v1/entities/team')
            .reply(200, {
                data: [{
                    id: '018d7442-4b4e-4ff3-acc6-f2d865a6e6ad'
                }]
            });
    });

    describe('A call to data resolve controller for user details context', () => {
        beforeEach(() => {
            nock('http://localhost:9001')
                .get('/v2/view_rolemembers?filter=rolelabel=eq.bfint')
                .reply(200, [{
                    email: 'integritylead1@homeoffice.gov.uk',
                    defaultteamid: '15a13c2a-fa63-4437-b4b0-d6b070e9c17e',
                }])
                .post('/v1/rpc/extendedstaffdetails', {
                    argstaffemail: 'staffmember@homeoffice.gov.uk'
                })
                .reply(200, [{
                    linemanager_email: 'linemanager@homeoffice.gov.uk'
                }]);
        });

        it('it should return an updated form schema for user details context', async () => {
            const request = httpMocks.createRequest({
                method: 'GET',
                url: '/api/translation/form/userDetailsContextForm',
                params: {
                    id: 'userDetailsContextForm'
                },
                kauth: {
                    grant: {
                        access_token: {
                            token: 'test-token',
                            content: {
                                session_state: 'session_id',
                                email: 'staffmember@homeoffice.gov.uk',
                                preferred_username: 'test',
                                given_name: 'firstname',
                                family_name: 'surname'
                            }
                        }

                    }
                }
            });
            const response = await formTranslateController.getForm(request);

            const grade = JSONPath.value(response, "$..components[?(@.key=='grade')].defaultValue");
            const personId = JSONPath.value(response, "$..components[?(@.key=='personid')].defaultValue");

            expect(grade).to.equal('gradeid');
            expect(personId).to.equal('staffid');
        });
    });

    describe('A call to data resolve controller for with details for user context', () => {
        it('it should return an updated form schema with null values', async () => {
            const request = httpMocks.createRequest({
                method: 'GET',
                url: '/api/translation/form/userDetailsContextForm',
                params: {
                    id: 'userDetailsContextForm'
                },
                kauth: {
                    grant: {
                        access_token: {
                            token: 'test-token',
                            content: {
                                session_state: 'session_id',
                                email: 'noEmail',
                                preferred_username: 'test',
                                given_name: 'testgivenname',
                                family_name: 'testfamilyname'
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
