export default class TranslationServiceError {
    constructor(message, code) {
        let err = new Error(message);
        err.code = code;
        return err;
    }
}
