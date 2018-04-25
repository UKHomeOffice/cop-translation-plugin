
// info: User found {"staffattributesid":13,"email":"amin.mohammed-coleman@digital.homeoffice.gov.uk","grade":"None","securitycleared":false,"securitycleareddate":null,"personid":"be457624-a91c-4e28-9995-560c131f566f","phone":"+44 7887 563451","firstname":"Amin","lastname":"Mohammed-Coleman"}

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