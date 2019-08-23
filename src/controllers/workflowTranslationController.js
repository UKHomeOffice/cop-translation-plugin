import KeycloakContext from '../models/KeycloakContext';

export default class WorkflowTranslationController {
    constructor(processService, formTranslator) {
      this.processService = processService;
      this.formTranslator = formTranslator;
    }


    async startProcessInstance(req) {
      const keycloakContext = new KeycloakContext(req.kauth);
      const headers = this.createHeader(keycloakContext);
      const formId = req.body.formId;

      return this.formTranslator.translateForSubmission(formId, req.body, keycloakContext, async () => {
          return this.processService.startProcessInstance(req.body, headers);
      })

    }

    async completeTask(req) {
      const {taskId} = req.params;
      const taskData = req.body;
      const keycloakContext = new KeycloakContext(req.kauth);
      const headers = this.createHeader(keycloakContext);
      const formId = req.body.formId;
      const formData =  {
        data: JSON.parse(taskData.data)
      };

      return this.formTranslator.translateForSubmission(formId, formData, keycloakContext, async () => {
          taskData.data = JSON.stringify(formData.data);
          return this.processService.completeTask(taskId, taskData, headers);
      })

    }

    createHeader(keycloakContext) {
        return {
            'Authorization': `Bearer ${keycloakContext.accessToken}`,
            'Content-Type': 'application/json',
            'Accept-Type': 'application/json'
        };
    }
}
