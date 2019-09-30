import logger from '../config/winston';
import FormioUtils from "formiojs/utils";
import JSONPath from 'jsonpath';

export default class FormDataDecryptor {
    constructor(dataDecryptor) {
      this.dataDecryptor = dataDecryptor;
    }


    /**
     * Decrypts any fields listed in the encryptedFields field.
     */
    decryptFormData(formData, dataContext) {
        const encrypted = formData.encryptedFields;
        if (Array.isArray(encrypted)) {
            encrypted.forEach(field => {
                const value = formData[field];
                if (value) {
                  try {
                      formData[field] = this.dataDecryptor.decrypt(dataContext.processContext.encryptionMetaData, Buffer.from(value, 'base64')).toString();
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


    /** Encrypts any form fields marked as sensitive.
     *
     * An array containing field names of all encrypted fields is added to the
     * form data as encryptedFields to support later decryption.
     */
    encryptFormData(components, formData, submissionContext) {
        FormioUtils.eachComponent(components, (component, path) => {
            if (!path) {
              return;
            }
            const jsonPath = `$.${path}`;
            const data = JSONPath.value(formData, jsonPath);

            if (Array.isArray(data)) {
                data.map(item => {
                  this.encryptFormData(component.components, item, submissionContext);
                });
            } else {
                if (this.isEncrypted(component)) {
                    const clearText = data;
                    if (clearText) {
                        const cipherText = this.dataDecryptor.encrypt(submissionContext.encryptionMetaData, clearText);
                        JSONPath.value(formData, jsonPath, cipherText.toString('base64'));
                        this.updateEncryptedFields(formData, jsonPath);
                    }
                }
            }
        })
    }

    isEncrypted(component) {
        return component.tags && component.tags.find(t => t === 'sensitive')
    }

    updateEncryptedFields(formData, jsonPath) {
        const paths = JSONPath.paths(formData, jsonPath);
        const parent = JSONPath.parent(formData, jsonPath);
        const encryptedFields = parent.encryptedFields || [];

        encryptedFields.push(paths[0].slice(-1)[0]);
        parent.encryptedFields = encryptedFields;
    }
}
