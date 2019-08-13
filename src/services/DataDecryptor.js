import crypto from 'crypto';
import logger from '../config/winston';
import TranslationServiceError from "../TranslationServiceError";

export default class DataDecryptor {
    constructor(ecKey) {
        if (!ecKey) {
            throw new TranslationServiceError('Private key is missing', 500);
        }
        this.ecKey = crypto.createECDH(DataDecryptor.curveName);
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

    encrypt(value) {
        const iv = crypto.randomBytes(16); // random bytes
        const key = crypto.createECDH(DataDecryptor.curveName);
        key.generateKeys();
        const sessionKey = this.deriveSessionKey(key.getPublicKey());

        const enc = crypto.createCipheriv(DataDecryptor.algorithm, sessionKey, iv);
        const cipherText = Buffer.concat([enc.update(value), enc.final()]);

        return {
          value: Buffer.concat([cipherText, enc.getAuthTag()]),
          iv: iv,
          publicKey: key.getPublicKey()
        };
    }

}

DataDecryptor.algorithm = "aes-256-gcm";
DataDecryptor.curveName = 'brainpoolP512t1';
