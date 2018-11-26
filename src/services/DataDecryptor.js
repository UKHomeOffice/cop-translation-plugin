import crypto from 'crypto';
import * as logger from '../config/winston';

export default class DataDecryptor {
    constructor(rsaKey) {
        this.rsaKey = rsaKey;
    }

    decryptSessionKey(sessionKey) {
        logger.info(`Decrypting session key`);
        return crypto.privateDecrypt({
            key: this.rsaKey,
        }, new Buffer(sessionKey, 'base64'));
    }


    decrypt(sessionKey, val, initializationVector) {
        const decipher = crypto.createDecipheriv(DataDecryptor.algorithm,
            sessionKey, initializationVector);
        const tag = val.slice(val.length - 16, val.length);
        const data = val.slice(0, val.length - 16);
        decipher.setAuthTag(tag);
        let plainText = decipher.update(data);
        plainText += decipher.final();
        return plainText;
    }
}

DataDecryptor.algorithm = "aes-256-gcm";
