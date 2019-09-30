import crypto from 'crypto';
import logger from '../config/winston';
import TranslationServiceError from "../TranslationServiceError";

/** Encrypts and decrypts data using elliptic curve crypto.
 *
 * In general, methods operate on and return buffers of binary data.
 *
 * Symmetric keys (session keys) are derived from the server's private key and
 * an ephemeral public key. These public keys are stored in the Operational
 * Data store.  Private keys are expected to be available in the environment.
 *
 * Symmetric cipher: AES-256-GCM/No Padding
 * Curve: brainpoolP512t1
 */

export default class DataDecryptor {
    constructor(ecKey, keyRepository) {
        if (!ecKey) {
            throw new TranslationServiceError('Private key is missing', 500);
        }
        this.ecKey = crypto.createECDH(DataDecryptor.curveName);
        this.ecKey.setPrivateKey(ecKey.slice(8, 64));
        this.keyRepository = keyRepository;
    }

    deriveSessionKey(publicKey) {
        logger.debug(`Deriving session key`);
        const sharedSecret = this.ecKey.computeSecret(publicKey);
        const hash = crypto.createHash('sha256');
        hash.update(sharedSecret);
        return hash.digest();
    }


    decrypt(keys, val) {
        if (!keys) {
            return val;
        }
        const { publicKey, iv } = keys;
        const sessionKey = this.deriveSessionKey(publicKey);
        const decipher = crypto.createDecipheriv(DataDecryptor.algorithm, sessionKey, iv);
        const tag = val.slice(val.length - 16, val.length);
        const data = val.slice(0, val.length - 16);
        decipher.setAuthTag(tag);
        return Buffer.concat([decipher.update(data), decipher.final()]);
    }

    encrypt(keys, value) {
        const { publicKey, iv } = keys;
        const sessionKey = this.deriveSessionKey(publicKey);

        const enc = crypto.createCipheriv(DataDecryptor.algorithm, sessionKey, iv);
        const cipherText = Buffer.concat([enc.update(value), enc.final()]);

        return Buffer.concat([cipherText, enc.getAuthTag()]);
    }

    ensureKeys(businessKey) {
        const existing = this.keyRepository.getKeys(businessKey);
        if (existing) {
          return existing;
        }
        const iv = crypto.randomBytes(16);
        const key = crypto.createECDH(DataDecryptor.curveName);
        key.generateKeys();

        this.keyRepository.putKeys(businessKey, key.getPublicKey(), iv);

        return {
          iv: iv,
          publicKey: key.getPublicKey()
        };
    }

}

DataDecryptor.algorithm = "aes-256-gcm";
DataDecryptor.curveName = 'brainpoolP512t1';
