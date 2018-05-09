
class UserDetailsContext {

    constructor(user) {
        const hasUser = user && user !== undefined;
        this.email = hasUser ? user.email : null;
        this.grade = hasUser ? user.grade: null;
        this.securityCleared = hasUser ? user.securitycleared: false;
        this.securityClearedDate = hasUser ? user.securitycleareddate: null;
        this.phone = hasUser ? user.phone: null;
        this.personId = hasUser? user.personid: null;
        this.firstName = hasUser? user.firstname: null;
        this.lastName = hasUser? user.lastname: null;
    }


}


export default UserDetailsContext;