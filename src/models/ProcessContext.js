
class ProcessContext {
    constructor(variables) {
        if (variables && variables.data) {
            Object.keys(variables.data).forEach(key => {
                const variable = variables.data[key];
                if (variable.type.toLowerCase() === 'json' || variable.type.toLowerCase() === 'object') {
                    this[key] = JSON.parse(variable.value);
                } else {
                    this[key] = variable.value
                }
            });
        }
        this.businessKey = 'hardcodedBusinessKey';
    }
}

export default ProcessContext;
