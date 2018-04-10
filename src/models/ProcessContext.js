
class ProcessContext {
    constructor(variables) {
        Object.keys(variables.data).forEach(key => {
            this[key] = variables.data[key].value
        });
    }
}

export default ProcessContext;