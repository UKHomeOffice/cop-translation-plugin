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


export {
    taskData,
    taskVariables,
    processVariables
}