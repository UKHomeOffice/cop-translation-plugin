import crypto from 'crypto';
import logger from '../config/winston';
import TranslationServiceError from "../TranslationServiceError";

export default class DataDecryptor {
    constructor(ecKey) {
        if (!ecKey) {
            throw new TranslationServiceError('Private key is missing', 500);
        }
        this.ecKey = crypto.createECDH('brainpoolP512t1');
        this.ecKey.setPrivateKey(ecKey);
    }

    deriveSessionKey(publicKey) {
        logger.debug(`Deriving session key`);
        const sharedSecret = this.ecKey.computeSecret(publicKey);
        const hash = crypto.createHash('sha256');
        hash.update(sharedSecret);
        return hash.digest();
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
