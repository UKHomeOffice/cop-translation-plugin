import {expect} from '../setUpTests'
import DataResolveContext from '../../src/models/DataResolveContext';

describe('DataResolveContext', () => {
    it('should return the correct data', () => {
            const keycloakContext = {context: 'keycloak'};
            const staffDetailsDataContext = {context: 'staff-details'};
            const environmentContext = {context: 'environment'};
            const processContext = {context: 'process'};
            const taskContext = {context: 'task'};
            const customDataContext = {contextInCustomData: 'custom-data'};
            const shiftDetailsContext = {context: 'shift-details'};
            const extendedStaffDetailsContext = {context: 'extended-staff-details'};

            const dataResolveContext = new DataResolveContext(
                keycloakContext,
                staffDetailsDataContext,
                environmentContext,
                processContext,
                taskContext,
                customDataContext,
                shiftDetailsContext,
                extendedStaffDetailsContext
            );

            expect(dataResolveContext.keycloakContext).to.equal(keycloakContext);
            expect(dataResolveContext.staffDetailsDataContext).to.equal(staffDetailsDataContext);
            expect(dataResolveContext.environmentContext).to.equal(environmentContext);
            expect(dataResolveContext.processContext).to.equal(processContext);
            expect(dataResolveContext.taskContext).to.equal(taskContext);
            expect(dataResolveContext.customDataContext).to.equal(undefined);
            expect(dataResolveContext.contextInCustomData).to.equal(customDataContext.contextInCustomData);
            expect(dataResolveContext.shiftDetailsContext).to.equal(shiftDetailsContext);
    });
});
