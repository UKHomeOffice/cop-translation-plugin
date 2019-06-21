import FilterComponentVisitor from '../../src/form/FilterComponentVisitor'
import {expect} from '../setUpTests'
import JsonPathEvaluator from '../../src/form/JsonPathEvaluator';

describe('FilterComponentVisitor', () => {
    describe('visit()', () => {
        const formComponent = {
            component: {
                key: 'teammembers'
            },
            dataContext: {
                shiftDetailsContext: {
                    staffid: 'cd2a2hd1-98a8-4a8a-2de8-7cbd19371438'
                }
            }
        };
        const jsonPathEvaluator = new JsonPathEvaluator();

        it('should return the correct value when a json path is given', () => {
            formComponent.component.filter = 'arglinemanagerid={$.shiftDetailsContext.staffid}';
            const filterComponentVisitor = new FilterComponentVisitor(jsonPathEvaluator);
            filterComponentVisitor.visit(formComponent);
            expect(formComponent.component.filter).to.equal('arglinemanagerid=cd2a2hd1-98a8-4a8a-2de8-7cbd19371438');
        });

        it('should return the correct value when a json path is not given', () => {
            formComponent.component.filter = 'islinemanager=true';
            const filterComponentVisitor = new FilterComponentVisitor(jsonPathEvaluator);
            filterComponentVisitor.visit(formComponent);
            expect(formComponent.component.filter).to.equal('islinemanager=true');
        });

        it('should return a component without a filter property if a filter property does not exist', () => {
            delete formComponent.component.filter;
            const filterComponentVisitor = new FilterComponentVisitor(jsonPathEvaluator);
            filterComponentVisitor.visit(formComponent);
            expect(formComponent.component).to.not.have.property('filter');
        });
    });
});
