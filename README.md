# Translation Plugin

This component is used within in the context for the Form API Server. This is mounted and the index.js is used to
register the data context factory. When a form is requested by a caller through the form api server then server will
invoke a call to the DataContextFactory and parse the form. You can customise the form further with a call to the postProcess
method.

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
{$.shiftDetailsContext.shiftid}
{$.shiftDetailsContext.email}
{$.shiftDetailsContext.enddatetime}
{$.shiftDetailsContext.shifthours}
{$.shiftDetailsContext.shiftminutes}
{$.shiftDetailsContext.startdatetime}
{$.shiftDetailsContext.staffid}
{$.shiftDetailsContext.teamid}
{$.shiftDetailsContext.locationid}
{$.shiftDetailsContext.shifthistoryid}
{$.shiftDetailsContext.phone}
{$.shiftDetailsContext.roles}

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


Returns updated form schema


Running tests in IntelliJ:

Add the following to your Extrac Mocha Options:
```text
--require babel-polyfill --require babel-register --exit --recursive --timeout 5000
```
