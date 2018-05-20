
class StaffDetailsContext {

    constructor(staff) {
        const hasUser = staff && staff !== undefined;
        this.email = hasUser ? staff.email : null;
        this.gradeId = hasUser ? staff.gradetypeid: null;
        this.phone = hasUser ? staff.phone: null;
        this.staffId = hasUser? staff.staffid: null;
        this.identityId = hasUser? staff.identityid: null;
        this.firstName = hasUser? staff.firstname: null;
        this.lastName = hasUser? staff.surname: null;
        this.gradeName = hasUser? staff.gradename: null;
        this.qualificationTypes = hasUser? staff.qualificationtypes: null;
    }

}


export default StaffDetailsContext;