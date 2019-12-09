import {expect, dataContextFactory} from '../setUpTests';

describe('DataContextFactory', () => {
    it('Should set the business key on a processContext without one', async () => {
        const processData = {
          data: {
            form: {
              type: 'json',
              value: '{ "myField": "my data"}',
            }
          }
        };

        const processContext = await dataContextFactory.createProcessContext(processData);

        expect(processContext.businessKey).to.not.be.null;
        expect(processContext.businessKey).to.not.be.undefined;
    });
    it('Should not set the business key on a processContext with one', async () => {
        const processData = {
          data: {
            form: {
              type: 'json',
              value: '{ "businessKey": "existingKey"}',
            }
          }
        };

        const processContext = await dataContextFactory.createProcessContext(processData);

        expect(processContext.businessKey).to.equal('existingKey');
    });
});
