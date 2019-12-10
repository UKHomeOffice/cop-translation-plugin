import BusinessKeyVisitor from '../../src/form/BusinessKeyVisitor';
import {expect} from '../setUpTests';

describe('BusinessKeyVisitor', () => {

    const visitor = new BusinessKeyVisitor({
        newBusinessKey : async (prefix) => {
            return Promise.resolve('newBusinessKey');
        }
    });
    const dataContext = {
        processContext: {
            businessKey: 'newBusinessKey',
        },
    };
    it('populates the business key on a component with no default value', async () => {
        const component = {
            key: 'businessKey',
        };

        await visitor.visit({component, dataContext});

        expect(component.defaultValue).to.equal('newBusinessKey');
    });
    it('populates the business key on a component with empty default value', async () => {
        const component = {
            key: 'businessKey',
            defaultValue: '',
        };

        await visitor.visit({component, dataContext});

        expect(component.defaultValue).to.equal('newBusinessKey');
    });
    it('does not populate the business key on a component that is not a businessKey field', async () => {
        const component = {
            key: 'myField',
            defaultValue: '',
        };

        await visitor.visit({component, dataContext});

        expect(component.defaultValue).to.equal('');
    });
});
