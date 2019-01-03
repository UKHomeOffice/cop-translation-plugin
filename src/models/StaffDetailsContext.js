
class StaffDetailsContext {

    constructor(staff) {
        const hasUser = staff && (typeof staff !== "undefined");
        this.phone = hasUser ? staff.phone: null;
        this.email = hasUser ? staff.email : null;
        this.gradeId = hasUser ? staff.gradetypeid: null;
        this.identityId = hasUser? staff.identityid: null;
        this.firstName = hasUser? staff.firstname: null;
        this.lastName = hasUser? staff.surname: null;
        this.staffId = hasUser? staff.staffid: null;
        this.adelphi = hasUser? staff.adelphi: null;
        this.linemanagerId = hasUser? staff.linemanagerid: null;
        this.mandeclastupdate = hasUser? staff.mandeclastupdate: null;
        this.teamid = hasUser? staff.teamid: null;
        this.locationid = hasUser? staff.locationid: null;
        this.ministryid = hasUser? staff.ministryid: null;
        this.departmentid = hasUser? staff.departmentid: null;
        this.directorateid = hasUser? staff.directorateid: null;
        this.branchid = hasUser? staff.branchid: null;
        this.divisionid = hasUser? staff.divisionid: null;
        this.commandid = hasUser? staff.commandid: null;
        this.roles = hasUser? staff.roles: null;
        this.qualificationTypes = hasUser? staff.qualificationtypes: null;
    }

}


export default StaffDetailsContext;