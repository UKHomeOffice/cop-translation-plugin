import logger from '../config/winston';

export default class FormDataDecryptor {
    constructor(dataDecryptor) {
      this.dataDecryptor = dataDecryptor;
    }


    decryptFormData(formData, dataContext) {
        const encrypted = formData.encryptedFields;
        if (Array.isArray(encrypted)) {
            encrypted.forEach(field => {
                const value = formData[field];
                if (value) {
                  try {
                      formData[field] = this.dataDecryptor.decrypt(dataContext.processContext.businessKey, Buffer.from(value, 'base64')).toString();
                  } catch (err) {
                      logger.warn(`Unable to decrypt field ${field}: ${err.message}`, err); 
                  }
                }
            });
        }
        Object.keys(formData).map(key => {
            const value = formData[key];
            if (Array.isArray(value)) {
                value.forEach(v =>  this.decryptFormData(v, dataContext));
            } else if (Object(value) === value){
                this.decryptFormData(value, dataContext);
            }
        })
    }
}
