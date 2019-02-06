
class StaffDetailsContext {

    constructor(staff) {
        if (staff) {
            Object.keys(staff).forEach(key => {
                this[key] = staff[key];
            });
        }
    }

}


export default StaffDetailsContext;
