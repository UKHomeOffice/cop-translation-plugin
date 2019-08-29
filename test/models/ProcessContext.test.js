import ProcessContext from '../../src/models/ProcessContext';
import { expect } from '../setUpTests';

describe('ProcessContext', () => {
    it('should populate variables', () => {
        const processData = {
          data: {
            form: {
              type: 'json',
              value: '{ "myField": "my data"}',
            },
            processVariable: {
              type: 'string',
              value: 'Random Value',
            }
          }
        };

        const context = new ProcessContext(processData);

        expect(context.processVariable).to.equal('Random Value');
        expect(context.form.myField).to.equal('my data');
    });
    it('should populate businessKey', () => {
        const processData = {
          data: {
            form: {
              type: 'json',
              value: '{ "myField": "my data", "businessKey": "Some Key"}',
            }
          }
        };

        const context = new ProcessContext(processData);

        expect(context.form.myField).to.equal('my data');
        expect(context.form.businessKey).to.equal('Some Key');
        expect(context.businessKey).to.equal('Some Key');
    });
});
