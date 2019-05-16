
import nock from 'nock';
import httpMocks from 'node-mocks-http';
import {expect, formTranslateController} from '../setUpTests'

describe('Form Data Resolve Controller', () => {

    describe('A call to data resolve controller for user details  context', () => {
        beforeEach(() => {
            nock('http://localhost:8000')
                .get('/form?name=userDetailsContextForm')
                .reply(500, []);
            nock('http://localhost:9001')
                .get('/staffview?email=eq.emailTest123')
                .reply(200,

                    [
                        {
                            "phone": "phone",
                            "email": "emailTest123",
                            "gradetypeid": "gradetypeid",
                            "firstname": "firstname",
                            "surname": "surname",
                            "qualificationtypes": [
                                {
                                    "qualificationname": "dummy",
                                    "qualificationtype": "1"
                                },
                                {
                                    "qualificationname": "staff",
                                    "qualificationtype": "2"
                                }
                            ],
                            "staffid": "staffid",
                            "gradename": "grade"
                        }
                    ]);

            nock('http://localhost:9001')
                .get('/shift?email=eq.emailTest123')
                .reply(200, []);
        });
        it('it should return an updated form schema for user details context', async () => {
            const request = httpMocks.createRequest({
                method: 'GET',
                url: '/api/translation/form/userDetailsContextForm',
                params: {
                    formName: "userDetailsContextForm"
                },
                kauth: {
                    grant: {
                        access_token: {
                            token: "test-token",
                            content: {
                                session_state: "session_id",
                                email: "emailTest123",
                                preferred_username: "test",
                                given_name: "firstname",
                                family_name: "surname"
                            }
                        }

                    }
                }
            });

            await expect(formTranslateController.getForm(request)).to.eventually.be.rejectedWith(`An exception occurred while trying to get form userDetailsContextForm ... 'Error: Request failed with status code 500'`);
        });
    });

});
