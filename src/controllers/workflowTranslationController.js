import KeycloakContext from '../models/KeycloakContext';

export default class WorkflowTranslationController {
    constructor(processService) {
      this.processService = processService;
    }


    async startProcessInstance(req) {
      const headers = this.createHeader(req.kauth);

      return this.processService.startProcessInstance(req.body, headers);
    }

    async completeTask(req) {
      const {taskId} = req.params;
      const taskData = req.body;
      const headers = this.createHeader(req.kauth);

      return this.processService.completeTask(taskId, taskData, headers);
    }

    createHeader(kauth) {
        const keycloakContext = new KeycloakContext(kauth);
        return {
            'Authorization': `Bearer ${keycloakContext.accessToken}`,
            'Content-Type': 'application/json',
            'Accept-Type': 'application/json'
        };
    }
}
