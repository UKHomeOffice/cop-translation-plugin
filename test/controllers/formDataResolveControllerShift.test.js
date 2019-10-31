import JSONPath from 'jsonpath';
import nock from 'nock';
import httpMocks from 'node-mocks-http';
import * as forms from '../forms'
import {expect, formTranslateController} from '../setUpTests'

describe('Form Data Resolve Controller', () => {
    describe('resolve shift details context', () => {
        beforeEach(() => {
            nock('http://localhost:8000')
                .get('/form?name=shiftForm')
                .reply(200, {
                    total : 1,
                    forms: forms.shiftForm
                });

            nock('http://localhost:9001')
                .post('/v1/rpc/staffdetails', {
                    argstaffemail: 'email'
                })
                .reply(200, [{
                    staffid: 'abc-123',
                    defaultteamid: '018d7442-4b4e-4ff3-acc6-f2d865a6e6ad'
                }])
                .get('/v1/shift?email=eq.email')
                .reply(200, [{
                    locationid: 'currentlocationid',
                    teamid: 'teamid',
                    email: 'email'
                }])
                .get('/v1/entities/location?id=eq.currentlocationid')
                .reply(200, {data: [{
                    locationname: 'Current',
                    locationid: 'currentlocationid',
                    bflocationtypeid: 'bflocationtypeid'

                }]})
                .get('/v1/entities/bflocationtype?id=eq.bflocationtypeid')
                .reply(200, {data: [{
                    bflocationtypeid: 'bflocationtypeid',
                    seaport: true,
                    railterminal: false,
                    airport: false,
                    postexchange: false,
                    fixedtransport: false,
                    bordercrossing: false,
                    roadterminal: false
                }]})
                .get('/v1/view_rolemembers?select=email&rolelabel=eq.bfint,&branchid=eq.undefined')
                .reply(200, [])
                .post('/v1/rpc/extendedstaffdetails', {
                    argstaffemail: 'email'
                })
                .reply(200, [{
                    linemanager_email: 'linemanager@homeoffice.gov.uk'
                }])
                .get('/v1/entities/team')
                .reply(200, [{
                    id: '018d7442-4b4e-4ff3-acc6-f2d865a6e6ad'
                }]);
        });

        it('it should return an updated form schema for keycloakContext', async () => {
            const request = httpMocks.createRequest({
                method: 'GET',
                url: '/api/translation/form/shiftForm',
                params: {
                    formName: 'shiftForm'
                },
                kauth: {
                    grant: {
                        access_token: {
                            token: 'test-token',
                            content: {
                                session_state: 'session_id',
                                email: 'email',
                                preferred_username: 'test',
                                given_name: 'testgivenname',
                                family_name: 'testfamilyname'
                            }
                        }

                    }
                }
            });

            const response = await formTranslateController.getForm(request, response);
            const locationname = JSONPath.value(response, "$..components[?(@.key=='currentlocationname')].defaultValue");
            const classificationQuery = JSONPath.value(response, "$..components[?(@.key=='portclassificationquery')].defaultValue");

            expect(locationname).to.equal('Current');
            expect(classificationQuery).to.equal("&seaport=eq.true&railterminal=eq.false&airport=eq.false&postexchange=eq.false&fixedtransport=eq.false&bordercrossing=eq.false&roadterminal=eq.false")
        });
    });
});
