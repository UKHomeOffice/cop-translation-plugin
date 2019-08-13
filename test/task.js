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
            "\"sessionKey\": \"048edaf60d8bbd4f5bd11b4afc4ba4e607b4c86dd9798048d4f0060b07d54f177f5f24a3d58b76a24d1854a463d93e43db0918bffedda0d713d0a7d836f47310d10d14f8294f25526b335d68c25f77be92d9758fbb116246fd1572bb97d77a363e23b66ba005b0132b6df36cb686e446ff61b243d4193091a0f61efa9112d8b220\"," +
            "\"image\": \"YrKNEg44VLtfWzhlNbYb14XqgQ==\"}",
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
