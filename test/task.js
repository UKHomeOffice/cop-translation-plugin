const taskData = {
    task: {
        name: "taskName",
        description: "taskDescription"
    }
};

const taskVariables = {
    person: {
        type: "Object",
        value: "{\"firstName\": \"firstNameFromProcess\",\"lastName\": \"lastNameFromProcess\",\"id\": \"idFromProcess\"}",
        valueInfo: {
            objectTypeName: "xxxx",
            serializationDataFormat: "application/json"
        }
    }
};

const processVariables = {
    type: {
        type: "String",
        value: "non-notification",
        valueInfo: {}
    },
    person: {
        type: "Object",
        value: "{\"firstName\": \"firstNameFromProcess\",\"lastName\": \"lastNameFromProcess\",\"id\": \"idFromProcess\"}",
        valueInfo: {
            objectTypeName: "xxxx",
            serializationDataFormat: "application/json"
        }
    }
};

const processVariablesWithEncryptedFields = {
    type: {
        type: "String",
        value: "non-notification",
        valueInfo: {}
    },
    variable: {
        type: "Object",
        value: "{\"initialisationVector\": \"W25/yzadEQNeV7jnZ3dnbA==\"," +
            "\"sessionKey\": \"WqoPbVVIFP3qRfFGPqY3wPvIxiQdPNePOGBBLqqGTdI6hFIy75fIsBykTT2xGxA+rb0SmalbGjOF1IN5Mbj3kk9s9D9Sa0nAnnokkiFwVIJzhJX1EtZQgWnSgJvhb5jJesHfNV6mY+Rgp4LX5GVTQ/ZeDt8XbR0w1NzsNOova6eK4Nm4Yt3eWmEXc7E2yt8Dgj5VBnLdOqtpv6UGRJSVNzlezl9Yp0RtolIHiytT/QZeIimcVcNmvwn6lmVT4XJpD/Q4mmEFhyYuPs6xTXTO/16xBrRv/aqSY0qNKTUVnrwzQfJ7M7D5XmvaQhZ4dazeHeI9XIi/DtE6vV45Rqs1mw==\"," +
            "\"image\": \"fWjIpGyUPmU7JxL2Zh3qqQTRjg==\"}",
        valueInfo: {
            objectTypeName: "xxxx",
            serializationDataFormat: "application/json"
        }
    }
};


export {
    taskData,
    taskVariables,
    processVariables,
    processVariablesWithEncryptedFields
}
