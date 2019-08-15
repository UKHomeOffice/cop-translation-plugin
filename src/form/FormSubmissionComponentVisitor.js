import logger from '../config/winston';

export default class FormSubmissionComponentVisitor {
    constructor(dataDecryptor) {
      this.dataDecryptor = dataDecryptor;
    }

    visit(formComponent) {
      // TODO apply translations
    }
}
