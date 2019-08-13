import DataDecryptor from "../../src/services/DataDecryptor";
import {expect} from 'chai';
import fs from 'fs';
import crypto from 'crypto';

describe('DataDecryptor', () => {
    const ecKey = Buffer.from(fs.readFileSync('test/certs/enc.key', 'utf8'), 'hex');
    const dataDecryptor = new DataDecryptor(ecKey);
    const key = Buffer.from("048edaf60d8bbd4f5bd11b4afc4ba4e607b4c86dd9798048d4f0060b07d54f177f5f24a3d58b76a24d1854a463d93e43db0918bffedda0d713d0a7d836f47310d10d14f8294f25526b335d68c25f77be92d9758fbb116246fd1572bb97d77a363e23b66ba005b0132b6df36cb686e446ff61b243d4193091a0f61efa9112d8b220", 'hex');

    it('can derive session key', () => {
        const result = dataDecryptor.deriveSessionKey(key);
        expect(result.toString('hex').toUpperCase()).to.be.equal('8628CF27BFB9D6404F2292A3FE88FBDC87CB63209AFC1283C1D5342DB8888980');
    });

    it('can decrypt value with session key and iv', () => {

        const sessionKey = dataDecryptor.deriveSessionKey(key);
        const value = Buffer.from('YrKNEg44VLtfWzhlNbYb14XqgQ==', 'base64');
        const iv = Buffer.from('W25/yzadEQNeV7jnZ3dnbA==', 'base64');

        const result = dataDecryptor.decrypt(sessionKey, value, iv);
        expect(result.toString("base64")).to.equal('REFU');
    })

    it('can encrypt and decrypt a value', () => {
        const clearText = 'My very secret message';

        const encrypted = dataDecryptor.encrypt(clearText);

        const sessionKey = dataDecryptor.deriveSessionKey(encrypted.publicKey);
        const decrypted = dataDecryptor.decrypt(sessionKey, encrypted.value, encrypted.iv);

        expect(decrypted.toString()).to.equal(clearText);
    });
});
