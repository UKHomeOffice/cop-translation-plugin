import {expect} from '../setUpTests'
import ExtendedStaffDetailsContext from '../../src/models/ExtendedStaffDetailsContext';

describe('ExtendedStaffDetailsContext', () => {
    it('should return the correct data without the integrity lead', () => {
            const extendedStaffDetails = {
                linemanager_email: 'linemanager@homeoffice.gov.uk',
                delegate_email: [
                    'delegate1@homeoffice.gov.uk',
                    'delegate2@homeoffice.gov.uk'
                ]
            };
            const extendedStaffDetailsContext = new ExtendedStaffDetailsContext(extendedStaffDetails);

            expect(extendedStaffDetailsContext.linemanagerEmail).to.equal(extendedStaffDetails.linemanager_email);
            expect(extendedStaffDetailsContext.delegateEmails).to.equal(extendedStaffDetails.delegate_email);
    });

    it('should return the correct data with the integrity lead', () => {
        const extendedStaffDetails = {
            linemanager_email: 'linemanager@homeoffice.gov.uk',
            delegate_email: [
                'delegate1@homeoffice.gov.uk',
                'delegate2@homeoffice.gov.uk'
            ]
        };
        const integrityLeadEmail = [
            'integritylead1@homeoffice.gov.uk',
            'integritylead2@homeoffice.gov.uk'
        ]
        const extendedStaffDetailsContext = new ExtendedStaffDetailsContext(extendedStaffDetails, integrityLeadEmail);

        expect(extendedStaffDetailsContext.integrityLeadEmails).to.equal(integrityLeadEmail);
    });
});
