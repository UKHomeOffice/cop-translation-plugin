# Translation Service

## Responsibilities

#### Form Schema Data Resolution

When a form is requested by a client, this service will loaded the form schema from the form engine and perform data enrichment. Once enriched the schema will be sent to the caller.

A form schema may have default values with Json Path expression returned from the form engine

```$json

{
  components: [
    {
      type: 'textfield',
      key: 'firstName',
      label: 'First Name',
      input: true,
      defaultValue: '$.keycloakContext.givenName'
    },
    {
      type: 'textfield',
      key: 'lastName',
      label: 'Last Name',
      defaultValue: '$.keycloakContext.familyName'
      input: true
    },
    {
      type: 'button',
      action: 'submit',
      label: 'Submit',
      theme: 'primary'
    }
  ]
}


```

Using the logged in user's credentials the service will create a data context which will be used to resolve the json path expressions. Data resolvers will consist of:

1. Keycloak
2. Staff Attributes
3. Shift details
4. Environment urls
5. Process variables
6. Task details and variables

#### KeyCloak Data Context
```json

{$.keycloakContext.accessToken}
{$.keycloakContext.sessionId}
{$.keycloakContext.email}
{$.keycloakContext.userName}
{$.keycloakContext.givenName}
{$.keycloakContext.familyName}

```

#### Staff Data Context

```json
{$.staffDetailsDataContext.phone}
{$.staffDetailsDataContext.email}
{$.staffDetailsDataContext.gradeid}
{$.staffDetailsDataContext.identityid}
{$.staffDetailsDataContext.firstname}
{$.staffDetailsDataContext.surname}
{$.staffDetailsDataContext.adelphi}
{$.staffDetailsDataContext.linemanagerid}
{$.staffDetailsDataContext.mandeclastupdate}
{$.staffDetailsDataContext.staffid}
{$.staffDetailsDataContext.defaultteamid}
{$.staffDetailsDataContext.roles}
{$.staffDetailsDataContext.qualificationTypes}

```

#### Shift Data Context
```json
{$.shiftDetailsDataContext.shiftid}
{$.shiftDetailsDataContext.email}
{$.shiftDetailsDataContext.enddatetime}
{$.shiftDetailsDataContext.shifthours}
{$.shiftDetailsDataContext.shiftminutes}
{$.shiftDetailsDataContext.startdatetime}
{$.shiftDetailsDataContext.staffid}
{$.shiftDetailsDataContext.teamid}
{$.shiftDetailsDataContext.locationid}
{$.shiftDetailsDataContext.shifthistoryid}
{$.shiftDetailsDataContext.phone}
{$.shiftDetailsDataContext.roles}

```

#### Environment urls
```json
{$.environmentContext.operationalDataUrl}
{$.environmentContext.workflowUrl}
{$.environmentContext.referenceDataUrl}
{$.environmentContext.privateUiUrl}
```

#### Process Variables Data Context
If you have a process instance with variables you wish to access within your forms then you would need to use the processContext to access them.
```json
{$.processContext.myProcessVariableName.attribute}
```

##### Decrypted content (Currently images supported)

In order to decrypt image content you will need to tag the form component with 'encrypted' and provide the following 2 properties:

1. sessionKey
2. initialisationVector

These properties can have data context references for example (assuming your session key and initialisationVector is inside your process variable):

```json
sessionKey: {$.processContext.myVariable.metadata.sessionKey}
initialisationVector: {$.processContext.myVariable.metadata.initialisationVector}
```

**_All endpoints are protected using Keycloak_**

The following environment variables are required:

1. AUTH\_CLIENT\_ID
1. AUTH\_CLIENT\_SECRET
2. AUTH\_URL
3. AUTH\_REALM
4. PROTOCOL
5. PRIVATE\_FORM\_NAME
6. PRIVATE\_OPERATIONAL\_DATA\_URL
7. PRIVATE\_REFDATA\_URL
8. PRIVATE\_WORKFLOW\_ENGINE\_NAME
9. EXT\_DOMAIN
9. CORS\_ORIGIN


#### Methods

##### POST

/api/translation/form

Example form schema that exists within the Form Engine Microservice:
```$json

{
  components: [
    {
      type: 'textfield',
      key: 'firstName',
      label: 'First Name',
      input: true,
      defaultValue: '$.firstName'
    },
    {
      type: 'textfield',
      key: 'lastName',
      label: 'Last Name',
      defaultValue: '$.myCustomObject.lastName'
      input: true
    },
    {
      type: 'button',
      action: 'submit',
      label: 'Submit',
      theme: 'primary'
    }
  ]
}


```

Example POST to the translation service:

```json
{
 "formName": "formName",
 "dataContext": {
    "firstName": "test",
    "myCustomObject": {
        "lastName" : "test"
    }
 }
}
```
Response from service:

```$json

{
  components: [
    {
      type: 'textfield',
      key: 'firstName',
      label: 'First Name',
      input: true,
      defaultValue: 'test'
    },
    {
      type: 'textfield',
      key: 'lastName',
      label: 'Last Name',
      defaultValue: 'test'
      input: true
    },
    {
      type: 'button',
      action: 'submit',
      label: 'Submit',
      theme: 'primary'
    }
  ]
}

```

##### GET

/api/translation/form/{testFormName}

Returns updated form schema


Running tests in IntelliJ:

Add the following to your Extrac Mocha Options:
```text
--require babel-polyfill --require babel-register --exit --recursive --timeout 5000
```

