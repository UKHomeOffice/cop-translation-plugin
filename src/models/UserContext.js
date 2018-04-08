class UserContext {

    constructor(user) {
        this.personid = user ? user.personid : null;
        this.staffAttributes = new StaffAttributes(user? user.staffattributes : null);
    }
}

export default UserContext;