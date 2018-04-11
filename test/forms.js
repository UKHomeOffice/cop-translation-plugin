const simpleForm = [{
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
];

const processContextForm = [{
    components: [
        {
            type: 'textfield',
            key: 'firstName',
            label: 'First Name',
            placeholder: 'Enter your first name.',
            defaultValue: '{$.processContext.person.firstName}',
            input: true
        },
        {
            type: 'textfield',
            key: 'lastName',
            label: 'Last Name',
            placeholder: 'Enter your last name',
            defaultValue: '{$.processContext.person.lastName}',
            input: true
        },
        {
            type: 'hidden',
            key: 'id',
            label: 'id',
            defaultValue: '{$.processContext.person.id}',
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

const taskContextForm = [{
    components: [
        {
            type: 'textfield',
            key: 'formName',
            label: 'Form Name',
            defaultValue: '{$.taskContext.name}',
            input: true
        },
        {
            type: 'textfield',
            key: 'firstName',
            label: 'First Name',
            placeholder: 'Enter your first name.',
            defaultValue: '{$.processContext.person.firstName}',
            input: true
        },
        {
            type: 'textfield',
            key: 'lastName',
            label: 'Last Name',
            placeholder: 'Enter your last name',
            defaultValue: '{$.processContext.person.lastName}',
            input: true
        },
        {
            type: 'hidden',
            key: 'id',
            label: 'id',
            defaultValue: '{$.taskContext.person.id}',
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

const userDetailsContextForm = [{
    components: [
        {
            type: 'textfield',
            key: 'grade',
            label: 'Grade',
            placeholder: 'Enter your first name.',
            defaultValue: '{$.userDetailsContext.grade}',
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


const customContextForm = [{
    components: [
        {
            type: 'textfield',
            key: 'firstName',
            label: 'First Name',
            placeholder: 'Enter your first name.',
            defaultValue: '{$.givenName}',
            input: true
        },
        {
            type: 'textfield',
            key: 'lastName',
            label: 'Last Name',
            placeholder: 'Enter your last name',
            defaultValue: '{$.myCustomObject.familyName}',
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

const noContextData = [{
    components: [
        {
            type: 'textfield',
            key: 'firstName',
            label: 'First Name',
            placeholder: 'Enter your first name.',
            defaultValue: 'Test',
            input: true
        },
        {
            type: 'textfield',
            key: 'lastName',
            label: 'Last Name',
            placeholder: 'Enter your last name',
            defaultValue: 'Test',
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

export {
    dataUrlForm,
    simpleForm,
    processContextForm,
    taskContextForm,
    userDetailsContextForm,
    customContextForm,
    noContextData
}