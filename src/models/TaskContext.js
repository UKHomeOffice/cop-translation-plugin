class TaskContext {

    constructor(task, variables) {
        if (task && task.data) {
            const taskData = task.data.task ? task.data.task : {};
            Object.keys(taskData).forEach(taskKey => {
                this[taskKey] = task.data.task[taskKey];
            });
        }

        if (variables && variables.data) {
            Object.keys(variables.data).forEach(key => {
                const variable = variables.data[key];
                if (variable.type.toLowerCase() === 'json' || variable.type.toLowerCase() === 'object') {
                    this[key] = JSON.parse(variable.value);
                } else {
                    this[key] = variable.value;
                }
            });
        }

    }
}



export default TaskContext;
