import {expect} from '../setUpTests'
import EnvironmentContext from '../../src/models/EnvironmentContext';

describe('EnvironmentContext', () => {
    it('should return the correct urls', () => {
            const config = {
                services: {
                        operationalData: {
                            url: 'http://operational-data-url'
                        },
                        workflow: {
                            url: 'http://workflow-url'
                        },
                        referenceData: {
                            url: 'http://reference-data-url'
                        },
                        privateUi: {
                            url: 'http://private-ui-url'
                        }
                }
            };
            const environmentContext = new EnvironmentContext(config);

            expect(environmentContext.operationalDataUrl).to.equal(config.services.operationalData.url);
            expect(environmentContext.workflowUrl).to.equal(config.services.workflow.url);
            expect(environmentContext.referenceDataUrl).to.equal(config.services.referenceData.url);
            expect(environmentContext.privateUiUrl).to.equal(config.services.privateUi.url);
    });
});
