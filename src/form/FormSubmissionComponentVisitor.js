import EncryptionSubmissionVisitor from './EncryptionSubmissionVisitor';

export default class FormSubmissionComponentVisitor {
    constructor(dataDecryptor) {
      this.encryptionVisitor = new EncryptionSubmissionVisitor(dataDecryptor);
    }

    visit(formComponent) {
      this.encryptionVisitor.visit(formComponent);
    }
}
