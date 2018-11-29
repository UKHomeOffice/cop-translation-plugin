import crypto from 'crypto';
import * as logger from '../config/winston';
import TranslationServiceError from "../TranslationServiceError";

export default class DataDecryptor {
    constructor(rsaKey) {
        this.rsaKey = rsaKey;
        if (!this.rsaKey) {
            throw new TranslationServiceError('RSA key is missing', 500);
        }
    }

    decryptSessionKey(sessionKey) {
        logger.info(`Decrypting session key`);
        return crypto.privateDecrypt({
            key: this.rsaKey,
        }, Buffer.from(sessionKey, 'base64'));
    }


    decrypt(sessionKey, val, initializationVector) {
        const decipher = crypto.createDecipheriv(DataDecryptor.algorithm,
            sessionKey, initializationVector);
        const tag = val.slice(val.length - 16, val.length);
        const data = val.slice(0, val.length - 16);
        decipher.setAuthTag(tag);
        return Buffer.concat([decipher.update(data), decipher.final()]);
    }
}

DataDecryptor.algorithm = "aes-256-gcm";
