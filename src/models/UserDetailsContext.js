import StaffAttributes from "../../dist/models/StaffAttributes";

class UserDetailsContext {

    constructor(user) {
        this.personid = user ? user.personid : null;
        this.staffAttributes = new StaffAttributes(user);
    }
}


export default UserDetailsContext;