
class UserDetailsContext {

    constructor(user) {
        const hasUser = user && user !== undefined;
        this.email = hasUser ? user.email : null;
        this.grade = hasUser ? user.grade: null;
        this.departmentCode = hasUser ? user.departmentcode: null;
        this.securityCleared = hasUser ? user.securitycleared: false;
        this.securityClearedDate = hasUser ? user.securitycleareddate: null;
        this.phone = hasUser ? user.phone: null;
        this.personId = hasUser? user.personid: null;
    }
}


export default UserDetailsContext;