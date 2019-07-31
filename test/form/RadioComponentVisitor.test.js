import RadioComponentVisitor from '../../src/form/RadioComponentVisitor'
import {expect} from '../setUpTests'
import JsonPathEvaluator from '../../src/form/JsonPathEvaluator';

describe('RadioComponentVisitor', () => {
    describe('visit()', () => {
        const value1 = { };
        const value2 = { };
        const formComponent = {
            component: {
                key: 'teammembers',
                values: [value1, value2]
            },
            dataContext: {
                shiftDetailsContext: {
                    officerName: 'Joe Bloggs'
                }
            }
        };
        const jsonPathEvaluator = new JsonPathEvaluator();
        const radioComponentVisitor = new RadioComponentVisitor(jsonPathEvaluator);

        it('should return the correct value when a json path is given', () => {
            value1.label = "{$.shiftDetailsContext.officerName} is not here";
            value2.label = "{$.shiftDetailsContext.officerName} is here";
            radioComponentVisitor.visit(formComponent);
            expect(value1.label).to.equal('Joe Bloggs is not here');
            expect(value2.label).to.equal('Joe Bloggs is here');
        });

        it('should return the correct value when a json path is not given', () => {
            value1.label = "yes";
            value2.label = "no";
            radioComponentVisitor.visit(formComponent);
            expect(value1.label).to.equal('yes');
            expect(value2.label).to.equal('no');
        });

        it('should return a value without a label property if a label property does not exist', () => {
            delete value1.label;
            radioComponentVisitor.visit(formComponent);
            expect(value1).to.not.have.property('label');
        });

        it('should return a component without a values property if a values property does not exist', () => {
            delete formComponent.component.values;
            radioComponentVisitor.visit(formComponent);
            expect(formComponent.component).to.not.have.property('values');
        });

        it('should return a component with empty values property if a values property is empty', () => {
            formComponent.component.values = [];
            radioComponentVisitor.visit(formComponent);
            expect(formComponent.component.values).to.eql([]);
        });
    });
});
