import {expect} from '../setUpTests'
import ExtendedStaffDetailsContext from '../../src/models/ExtendedStaffDetailsContext';

describe('ExtendedStaffDetailsContext', () => {
    it('should return the correct data', () => {
            const extendedStaffDetails = {
                linemanager_email: 'linemanager@homeoffice.gov.uk',
                delegate_email: [
                    'delegate1@homeoffice.gov.uk',
                    'delegate2@homeoffice.gov.uk'
                ],
                integrityLeadEmail: [
                    'integritylead1@homeoffice.gov.uk',
                    'integritylead2@homeoffice.gov.uk'
                ]
            };
            const extendedStaffDetailsContext = new ExtendedStaffDetailsContext(extendedStaffDetails);

            expect(extendedStaffDetailsContext.linemanagerEmail).to.equal(extendedStaffDetails.linemanager_email);
            expect(extendedStaffDetailsContext.delegateEmails).to.equal(extendedStaffDetails.delegate_email);
            expect(extendedStaffDetailsContext.integrityLeadEmails).to.equal(extendedStaffDetails.integrityLeadEmail);
    });
});
