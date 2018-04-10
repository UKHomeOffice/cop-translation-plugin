
class UserDetailsContext {

    constructor(user) {
        this.personid = user ? user.personid : null;
        this.email = user ? user.email : null;
        this.grade = user ? user.grade: null;
        this.departmentCode = user ? user.departmentcode: null;
        this.securityCleared = user ? user.securitycleared: false;
        this.securityClearedDate = user ? user.securitycleareddate: null;
        this.phone = user ? user.phone: null;
        this.personId = user? user.personid: null;
    }
}


export default UserDetailsContext;