
class ProcessContext {
    constructor(variables) {
        if (variables && variables.data) {
            Object.keys(variables.data).forEach(key => {
                const variable = variables.data[key];
                if (variable.type.toLowerCase() === 'json' || variable.type.toLowerCase() === 'object') {
                    this[key] = JSON.parse(variable.value);
                    if (!this.businessKey && this[key].businessKey) {
                        this.businessKey = this[key].businessKey;
                    }
                } else {
                    this[key] = variable.value
                }
            });
        }
    }
}

export default ProcessContext;
