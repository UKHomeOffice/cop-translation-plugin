class TaskContext {

    constructor(task, variables) {
        Object.keys(task.data.task).forEach(taskKey => {
            this[taskKey] = task.data.task[taskKey];
        });
        Object.keys(variables.data).forEach(key => {
            this[key] = variables.data[key].value;
        });
    }

}

export default TaskContext;