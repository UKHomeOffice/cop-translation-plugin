import ContentComponentVisitor from '../../src/form/ContentComponentVisitor'
import FormComponent from '../../src/models/FormComponent'
import {expect} from '../setUpTests'
import JsonPathEvaluator from '../../src/form/JsonPathEvaluator';

describe('ContentComponentVisitor', () => {
    describe('visit()', () => {
        const formComponent = new FormComponent(
            {
                key: 'teammembers'
            },
            {
                shiftDetailsContext: {
                    staffid: 'cd2a2hd1-98a8-4a8a-2de8-7cbd19371438'
                }
            }
        );
        const jsonPathEvaluator = new JsonPathEvaluator();

        it('should return the correct value when a json path is given', () => {
            formComponent.component.html ='<h1>{$.shiftDetailsContext.staffid}</h1>';
            const contentComponentVisitor = new ContentComponentVisitor(jsonPathEvaluator);
            contentComponentVisitor.visit(formComponent);
            expect(formComponent.component.html).to.equal('<h1>cd2a2hd1-98a8-4a8a-2de8-7cbd19371438</h1>');
        });

        it('should return the correct value when a json path is not given', () => {
            formComponent.component.html ='<h1>No path</h1>';
            const contentComponentVisitor = new ContentComponentVisitor(jsonPathEvaluator);
            contentComponentVisitor.visit(formComponent);
            expect(formComponent.component.html).to.equal('<h1>No path</h1>');
        });

    });
});
