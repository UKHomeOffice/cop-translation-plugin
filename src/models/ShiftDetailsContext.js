class ShiftDetailsContext {
    constructor(shift) {
        if (shift && shift.data) {
            const data = shift.data;
            Object.keys(data).forEach(key => {
                this[key] = data[key];
            });
        }
    }
}

export default ShiftDetailsContext;