process.env.NODE_ENV = 'test';
process.env.FORM_URL = 'http://localhost:8000';
process.env.WORKFLOW_URL = 'http://localhost:9000';
process.env.REFERENCE_DATA_URL = 'http://localhost:9001';


import JSONPath from "jsonpath";
import nock from 'nock';
import httpMocks from 'node-mocks-http';
import expect from 'expect';
import formDataController from '../src/controllers/formDataResolveController';

const forms = [{
    components: [
        {
            type: 'textfield',
            key: 'firstName',
            label: 'First Name',
            placeholder: 'Enter your first name.',
            defaultValue: '{$.keycloakContext.givenName}',
            input: true
        },
        {
            type: 'textfield',
            key: 'lastName',
            label: 'Last Name',
            placeholder: 'Enter your last name',
            defaultValue: '{$.keycloakContext.familyName}',
            input: true
        },
        {
            type: 'hidden',
            key: 'sessionId',
            label: 'sessionid',
            defaultValue: '{$.keycloakContext.sessionId}',
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

const dataUrlForm = [
    {
        components: [
            {
                "errorLabel": "Region selection required to filter location",
                "tooltip": "Selecting a region will filter the location drop down list",
                "customClass": "",
                "properties": {},
                "conditional": {
                    "show": "",
                    "when": null,
                    "eq": ""
                },
                "tags": [],
                "labelPosition": "top",
                "type": "select",
                "validate": {
                    "required": true
                },
                "clearOnHide": true,
                "hidden": false,
                "persistent": true,
                "unique": false,
                "protected": false,
                "multiple": false,
                "template": "<span>{{ item.regionname }}</span>",
                "authenticate": false,
                "filter": "",
                "refreshOn": "",
                "defaultValue": "",
                "valueProperty": "regionid",
                "dataSrc": "url",
                "data": {
                    "disableLimit": true,
                    "values": [
                        {
                            "value": "",
                            "label": ""
                        }
                    ],
                    "json": "",
                    "url": "{$.environmentContext.referenceDataUrl}/region",
                    "resource": "",
                    "custom": "",
                    "headers": []
                },
                "placeholder": "Select a region",
                "key": "regionid",
                "label": "Region",
                "tableView": true,
                "input": true,
                "lockKey": true,
                "hideLabel": false
            }
        ]
    }

]

describe('Form Data Resolve Controller', () => {

    describe('A call to data resolve controller for input type', () => {
        beforeEach(() => {
            nock('http://localhost:8000')
                .get('/form?name=testForm')
                .reply(200, forms);
        });
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

                const firstName = JSONPath.value(updatedForm, "$..components[?(@.key=='firstName')].defaultValue");
                const lastName = JSONPath.value(updatedForm, "$..components[?(@.key=='lastName')].defaultValue");
                const sessionId = JSONPath.value(updatedForm, "$..components[?(@.key=='sessionId')].defaultValue");

                expect(firstName).toEqual("testgivenname");
                expect(lastName).toEqual("testfamilyname");
                expect(sessionId).toEqual("session_id");
                done();
            });
        });
    });

    describe('A call to data resolve controller for url type', () => {
        beforeEach(() => {
            nock('http://localhost:8000')
                .get('/form?name=dataUrlForm')
                .reply(200, dataUrlForm);
        });
        it('it should return an updated form schema for url', (done) => {
            const request = httpMocks.createRequest({
                method: 'GET',
                url: '/api/translation/form/dataUrlForm',
                params: {
                    formName: "dataUrlForm"
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
                const url = JSONPath.value(updatedForm, "$..components[?(@.key=='regionid')].data.url");
                expect(url).toEqual("http://localhost:9001/region");
                done();
            });
        });
    });

});