export default class EncryptionSubmissionVisitor {
    constructor(dataDecryptor) {
      this.dataDecryptor = dataDecryptor;
    }

    visit(formComponent) {
      if (formComponent.isEncrypted()) {
        const clearText = formComponent.getData();
        if (clearText) {
            const cipherText = this.dataDecryptor.encrypt(formComponent.businessKey, clearText);
            formComponent.setData(cipherText.toString('base64'));
        }
      }
    }
}
