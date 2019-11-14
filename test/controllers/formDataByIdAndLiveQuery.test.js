
import nock from 'nock';
import httpMocks from 'node-mocks-http';
import * as forms from '../forms'
import {expect, formTranslateController} from '../setUpTests'
import sinon from "sinon";
import uuid4 from 'uuid';

describe('Form Data Resolve Controller with UUID and live === 1', () => {
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

    it('returns a form when id and live requested', async () => {
        const uuid = uuid4();
        nock('http://localhost:8000')
            .get(`/form/${uuid}`)
            .reply(200, forms.simpleForm[0]);

        const request = httpMocks.createRequest({
            method: 'GET',
            url: `/form/${uuid}`,
            params: {
                id: `${uuid}`
            },
            query: {
                live: '1'
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
        expect(response.name).to.equal("simpleForm");
    });

});
