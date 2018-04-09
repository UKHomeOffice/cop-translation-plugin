class TaskVariableContext {

    constructor(task, variables) {
        this.taskId = task.id;
        this.name = task.name;
        this.description = task.description;
        this.createDate = task.created;
        this.dueDate = task.due;
        this.followUpDate = task.followUp;
        this.priority = thas.priority;

    }
}
export default TaskVariableContext;