class ShiftDetailsContext {
    constructor(shift) {
        if (shift) {
            Object.keys(shift).forEach(key => {
                this[key] = shift[key];
            });
        }
    }
}

export default ShiftDetailsContext;