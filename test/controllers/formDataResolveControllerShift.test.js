import JSONPath from "jsonpath";
import nock from 'nock';
import httpMocks from 'node-mocks-http';
import * as forms from '../forms'
import {expect, formTranslateController} from '../setUpTests'


describe('Form Data Resolve Controller', () => {

    describe('resolve shift details context', () => {
        beforeEach(() => {
            nock('http://localhost:8000')
                .get('/form?name=shiftForm')
                .reply(200, forms.shiftForm);
            nock('http://localhost:9001')
                .post('/api/platform-data/rpc/staffdetails', {
                    "argstaffemail": "email"
                })
                .reply(200, []);
            nock('http://localhost:9001')
                .get('/api/platform-data/shift?email=eq.email')
                .reply(200, [{
                    locationid: 'currentlocationid',
                    teamid: 'teamid',
                    email: 'email'
                }]);
            nock('http://localhost:9001')
                .get('/api/platform-data/rf_location?locationid=eq.currentlocationid')
                .reply(200, [{
                    locationname: 'Current',
                    locationid: 'currentlocationid',
                    bflocationtypeid: 'bflocationtypeid'

                }]);
            nock('http://localhost:9001')
                .get('/api/platform-data/rf_bflocationtype?bflocationtypeid=eq.bflocationtypeid')
                .reply(200, [{
                    bflocationtypeid: 'bflocationtypeid',
                    seaport: true,
                    railterminal: false,
                    airport: false,
                    postexchange: false,
                    fixedtransport: false,
                    bordercrossing: false,
                    roadterminal: false
                }]);
        });
        it('it should return an updated form schema for keycloakContext', async () => {
            const request = httpMocks.createRequest({
                method: 'GET',
                url: '/api/translation/form/shiftForm',
                params: {
                    formName: "shiftForm"
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

            const response = await formTranslateController.getForm(request, response);
            const locationname = JSONPath.value(response, "$..components[?(@.key=='currentlocationname')].defaultValue");
            const classificationQuery = JSONPath.value(response, "$..components[?(@.key=='portclassificationquery')].defaultValue");

            expect(locationname).to.equal("Current");
            expect(classificationQuery).to.equal("&seaport=eq.true&railterminal=eq.false&airport=eq.false&postexchange=eq.false&fixedtransport=eq.false&bordercrossing=eq.false&roadterminal=eq.false")

        });
    });

});
