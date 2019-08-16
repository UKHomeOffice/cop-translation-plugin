export default class WorkflowTranslationController {
    constructor(workflowEngine) {
      this.workflowEngine = workflowEngine;
    }


    async startProcessInstance(req) {
      return this.workflowEngine.startProcessInstance(req.body);
    }

    async completeTask(req) {
      const {taskId} = req.params;
      const taskData = req.body;

      return this.workflowEngine.completeTask(taskId, taskData);
    }

}
