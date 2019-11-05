class ExtendedStaffDetailsContext {
    constructor(extendedStaffDetails, integrityLeadEmail) {
        const { delegate_email, linemanager_delegate_email, linemanager_email } = extendedStaffDetails;
        this.linemanagerEmail = linemanager_email;
        this.delegateEmails = delegate_email;
        this.linemanagerDelegateEmails = linemanager_delegate_email;
        if (integrityLeadEmail) {
            this.integrityLeadEmails = integrityLeadEmail;
        }
    }
}

export default ExtendedStaffDetailsContext;
