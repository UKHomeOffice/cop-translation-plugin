import KeycloakContext from '../models/KeycloakContext';

export default class WorkflowTranslationController {
    constructor(processService, formTranslator) {
      this.processService = processService;
      this.formTranslator = formTranslator;
    }


    async startProcessInstance(req) {
      const headers = this.createHeader(req.kauth);
      const formId = req.body.formId;
      const formData =  {
        data: JSON.parse(req.body.data)
      };

      return this.formTranslator.translateForSubmission(formId, formData, async () => {
          req.body.data = JSON.stringify(formData.data);
          return this.processService.startProcessInstance(req.body, headers);
      })

    }

    async completeTask(req) {
      const {taskId} = req.params;
      const taskData = req.body;
      const headers = this.createHeader(req.kauth);
      const formId = req.body.formId;
      const formData =  {
        data: JSON.parse(taskData.data)
      };

      return this.formTranslator.translateForSubmission(formId, formData, async () => {
          taskData.data = JSON.stringify(formData.data);
          return this.processService.completeTask(taskId, taskData, headers);
      })

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
