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
#### Extended Staff Data Context

```json
{$.extendedStaffDetailsContext.linemanagerEmail}
{$.extendedStaffDetailsContext.delegateEmails}
{$.extendedStaffDetailsContext.integrityLeadEmails}

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

##### Encrypted content

In order to encrypt content you will need to tag the form component with 'sensitive':


**_All endpoints are protected using Keycloak_**

The following environment variables are required:

1. AUTH\_CLIENT\_ID
1. AUTH\_CLIENT\_SECRET
2. AUTH\_URL
3. AUTH\_REALM
3. PRIVATE\_KEY\_PATH
4. PROTOCOL
5. PRIVATE\_FORM\_NAME
6. PRIVATE\_OPERATIONAL\_DATA\_URL
7. PRIVATE\_REFDATA\_URL
8. PRIVATE\_WORKFLOW\_ENGINE\_NAME
9. EXT\_DOMAIN
9. CORS\_ORIGIN

`PRIVATE_KEY_PATH` refers to a EC private key in DER format generated with `openssl ecparam -genkey -name brainpoolP512t1 -outform der > keyfile.key`


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

# Drone Secrets

Name|Example value
---|---
dev_drone_aws_access_key_id|https://console.aws.amazon.com/iam/home?region=eu-west-2#/users/bf-it-devtest-drone?section=security_credentials
dev_drone_aws_secret_access_key|https://console.aws.amazon.com/iam/home?region=eu-west-2#/users/bf-it-devtest-drone?section=security_credentials
drone_public_token|Drone token (Global for all github repositories and environments)
env_api_cop_url|operational-data-api.dev.cop.homeoffice.gov.uk, operational-data-api.staging.cop.homeoffice.gov.uk, operational-data-api.cop.homeoffice.gov.uk
env_api_form_url|form-api-server.dev.cop.homeoffice.gov.uk, form-api-server.staging.cop.homeoffice.gov.uk, form-api-server.cop.homeoffice.gov.uk
env_api_ref_url|api.dev.refdata.homeoffice.gov.uk, api.staging.refdata.homeoffice.gov.uk, api.refdata.homeoffice.gov.uk
env_engine_url|private-workflow-engine.dev.cop.homeoffice.gov.uk, private-workflow-engine.staging.cop.homeoffice.gov.uk, private-workflow-engine.cop.homeoffice.gov.uk
env_keycloak_realm|cop-dev, cop-staging, cop-prod
env_keycloak_url|sso-dev.notprod.homeoffice.gov.uk/auth, sso.digital.homeoffice.gov.uk/auth
env_kube_namespace_private_cop|private-cop-dev, private-cop-staging, private-cop
env_kube_server|https://kube-api-notprod.notprod.acp.homeoffice.gov.uk, https://kube-api-prod.prod.acp.homeoffice.gov.uk
env_kube_token|xxx
env_redis_port|6379
env_redis_ssl|true|false
env_redis_token|xxx
env_redis_url|cop-dev-redis-rg-001.cop-dev-redis-rg.obrtxl.euw2.cache.amazonaws.com, cop-staging-redis-rg-001.cop-staging-redis-rg.swzhug.euw2.cache.amazonaws.com, cop-prod-redis-rg-001.cop-prod-redis-rg.swzhug.euw2.cache.amazonaws.com
env_translation_cors_origin|dev:https://www.dev.cop.homeoffice.gov.uk,http://localhost:8080, https://www.staging.cop.homeoffice.gov.uk, https://www.cop.homeoffice.gov.uk
env_translation_private_key|xxx
env_translation_url|translation.dev.cop.homeoffice.gov.uk, translation.staging.cop.homeoffice.gov.uk, translation.cop.homeoffice.gov.uk
env_whitelist|comma separated x.x.x.x/x list
env_www_url|www.dev.cop.homeoffice.gov.uk, www.staging.cop.homeoffice.gov.uk, www.cop.homeoffice.gov.uk
log_level_info|info
nginx_image|quay.io/ukhomeofficedigital/nginx-proxy
nginx_tag|latest
production_drone_aws_access_key_id|https://console.aws.amazon.com/iam/home?region=eu-west-2#/users/bf-it-prod-drone?section=security_credentials
production_drone_aws_secret_access_key|https://console.aws.amazon.com/iam/home?region=eu-west-2#/users/bf-it-prod-drone?section=security_credentials
protocol_https|https
quay_password|xxx (Global for all repositories and environments)
quay_username|docker (Global for all repositories and environments)
slack_webhook|https://hooks.slack.com/services/xxx/yyy/zzz (Global for all repositories and environments)
staging_drone_aws_access_key_id|https://console.aws.amazon.com/iam/home?region=eu-west-2#/users/bf-it-prod-drone?section=security_credentials
staging_drone_aws_secret_access_key|https://console.aws.amazon.com/iam/home?region=eu-west-2#/users/bf-it-prod-drone?section=security_credentials
translation_image|quay.io/ukhomeofficedigital/cop-private-translation-service
translation_keycloak_client_id|keycloak client name
translation_name|translation
translation_port|8083
translation_private_key_path|/enccerts/enc-key.pem
