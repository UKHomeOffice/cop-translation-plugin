import CustomPropertiesVisitor from '../../src/form/CustomPropertiesVisitor'
import {expect} from '../setUpTests'

describe('CustomPropertiesVisitor', () => {
    describe('visit()', () => {
        it('should add the custom properties to the component object when custom properties are given', () => {
            const formComponent = {
                component: {
                    properties: {
                      tooltipTitle: 'What to do if your grade isn\'t listed'
                    }
                }
            };
            const customPropertiesVisitor = new CustomPropertiesVisitor();
            customPropertiesVisitor.visit(formComponent);
            expect(formComponent.component).to.have.property('tooltipTitle');
            expect(formComponent.component.tooltipTitle).to.equal('What to do if your grade isn\'t listed');
        });

        it('should return the original object when no custom properties are given', () => {
            const formComponent = {
                component: {
                    properties: {}
                }
            };
            const customPropertiesVisitor = new CustomPropertiesVisitor();
            customPropertiesVisitor.visit(formComponent);
            expect(formComponent).to.deep.equal({
              component: {
                  properties: {}
              }
          });
        });
    });
});
