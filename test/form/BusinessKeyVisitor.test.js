import BusinessKeyVisitor from '../../src/form/BusinessKeyVisitor';
import {expect} from '../setUpTests';

describe('BusinessKeyVisitor', () => {
    const visitor = new BusinessKeyVisitor();
    const dataContext = {
        processContext: {
            businessKey: 'newBusinessKey',
        },
    };
    it('populates the business key on a component with no default value', () => {
        const component = {
            key: 'businessKey',
        };

        visitor.visit({ component, dataContext });

        expect(component.defaultValue).to.equal('newBusinessKey');
    });
    it('populates the business key on a component with empty default value', () => {
        const component = {
            key: 'businessKey',
            defaultValue: '',
        };

        visitor.visit({ component, dataContext });

        expect(component.defaultValue).to.equal('newBusinessKey');
    });
    it('does not populate the business key on a component that is not a businessKey field', () => {
        const component = {
            key: 'myField',
            defaultValue: '',
        };

        visitor.visit({ component, dataContext });

        expect(component.defaultValue).to.equal('');
    });
});
