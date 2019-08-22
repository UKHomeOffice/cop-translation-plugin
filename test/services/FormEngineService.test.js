import nock from "nock";
import * as forms from "../forms";
import {expect, formEngineService} from '../setUpTests'

const keycloakContext = {
    accessToken: 'Foo',
};

describe('Form Data Controller', () => {
    beforeEach(() => {
        nock('http://localhost:8000')
            .get('/form/myFormId?full=true')
            .reply(200, forms.simpleForm[0]);
        nock('http://localhost:8000')
            .get('/form/unknownFormId?full=true')
            .reply(404);
    });

    it('can load a form by id', async() => {
      const form = await formEngineService.getFormById('myFormId', keycloakContext);
      
      expect(form).to.not.be.null;
      expect(form.components).to.not.be.null;
    })
    it('throws an error when a form is not found', async() => {
      try {
        await formEngineService.getFormById('unknownFormId', keycloakContext);
        return Promise.reject('Did not receive expected error');
      } catch (err) {
        expect(err.message).to.equal("An exception occurred while trying to get form with id unknownFormId ... 'Error: Request failed with status code 404'");
      }
    })
});
