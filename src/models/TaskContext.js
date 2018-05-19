class TaskContext {

    constructor(task, variables) {
        if (task && task.data) {
            const taskData = task.data.task;
            Object.keys(taskData).forEach(taskKey => {
                this[taskKey] = task.data.task[taskKey];
            });
        }

        if (variables && variables.data) {
            Object.keys(variables.data).forEach(key => {
                this[key] = variables.data[key].value;
            });
        }

    }

}

export default TaskContext;