class ExtendedStaffDetailsContext {
    constructor(extendedStaffDetails, integrityLeadEmail) {
        this.linemanagerEmail = extendedStaffDetails.linemanager_email;
        this.delegateEmails = extendedStaffDetails.delegate_email;
        if (integrityLeadEmail) {
            this.integrityLeadEmails = integrityLeadEmail;
        }
    }
}

export default ExtendedStaffDetailsContext;
