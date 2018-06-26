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

    describe('resolve shift details context', () => {
        beforeEach(() => {
            nock('http://localhost:8000')
                .get('/form?name=shiftForm')
                .reply(200, forms.shiftForm);
            nock('http://localhost:9001')
                .get('/api/platform-data/staffview?email=eq.email')
                .reply(200, []);
            nock('http://localhost:9001')
                .get('/api/platform-data/shift?email=eq.email')
                .reply(200, [{
                    currentlocationid: 'currentlocationid',
                    locationid: 'locationid',
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
                .get('/api/platform-data/rf_bflocationtype/bflocationtypeid')
                .reply(200, {
                    bflocationtypeid: 'bflocationtypeid',
                    seaport: true,
                    railterminal: false,
                    airport: false,
                    postexchange: false,
                    fixedtransport: false,
                    bordercrossing: false,
                    roadterminal: false
                });
        });
        it('it should return an updated form schema for keycloakContext', (done) => {
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
            const response = httpMocks.createResponse({
                eventEmitter: require('events').EventEmitter
            });

            formDataController.getFormSchema(request, response);

            response.on('end', () => {
                expect(response.statusCode).toEqual(200);
                expect(response._isEndCalled()).toBe(true);
                const updatedForm = JSON.parse(response._getData());
                const locationname = JSONPath.value(updatedForm, "$..components[?(@.key=='currentlocationname')].defaultValue");
                const classificationQuery = JSONPath.value(updatedForm, "$..components[?(@.key=='portclassificationquery')].defaultValue");

                expect(locationname).toEqual("Current");
                expect(classificationQuery).toEqual("&seaport=eq.true&railterminal=eq.false&airport=eq.false&postexchange=eq.false&fixedtransport=eq.false&bordercrossing=eq.false&roadterminal=eq.false")
                done();
            });
        });
    });

});