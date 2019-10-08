class ExtendedStaffDetailsContext {
    constructor(extendedStaffDetails) {
        this.linemanagerEmail = extendedStaffDetails.linemanager_email;
        this.delegateEmails = extendedStaffDetails.delegate_email;
        this.integrityLeadEmails = extendedStaffDetails.integritylead_email;
    }
}

export default ExtendedStaffDetailsContext;
