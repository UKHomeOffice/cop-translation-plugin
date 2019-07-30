import LabelComponentVisitor from '../../src/form/LabelComponentVisitor'
import {expect} from '../setUpTests'
import JsonPathEvaluator from '../../src/form/JsonPathEvaluator';

describe('LabelComponentVisitor', () => {
    describe('visit()', () => {
        const formComponent = {
            component: {
                key: 'teammembers'
            },
            dataContext: {
                shiftDetailsContext: {
                    officerName: 'Joe Bloggs'
                }
            }
        };
        const jsonPathEvaluator = new JsonPathEvaluator();
        const labelComponentVisitor = new LabelComponentVisitor(jsonPathEvaluator);

        it('should return the correct value when a json path is given', () => {
            formComponent.component.label = 'The officer\'s name is {$.shiftDetailsContext.officerName}';
            labelComponentVisitor.visit(formComponent);
            expect(formComponent.component.label).to.equal('The officer\'s name is Joe Bloggs');
        });

        it('should return the correct value when a json path is not given', () => {
            formComponent.component.label = 'Nothing to substitute';
            labelComponentVisitor.visit(formComponent);
            expect(formComponent.component.label).to.equal('Nothing to substitute');
        });

        it('should return a component without a label property if a label property does not exist', () => {
            delete formComponent.component.label;
            labelComponentVisitor.visit(formComponent);
            expect(formComponent.component).to.not.have.property('label');
        });
    });
});
