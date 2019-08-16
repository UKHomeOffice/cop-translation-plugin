import DataDecryptor from "../../src/services/DataDecryptor";
import KeyRepository from "../../src/services/KeyRepository";
import {expect} from 'chai';
import sinon from 'sinon';
import fs from 'fs';

describe('DataDecryptor', () => {
    const ecKey = Buffer.from(fs.readFileSync('test/certs/enc.key'));
    const keyRepository = sinon.createStubInstance(KeyRepository);
    const dataDecryptor = new DataDecryptor(ecKey, keyRepository);
    const key = Buffer.from("048edaf60d8bbd4f5bd11b4afc4ba4e607b4c86dd9798048d4f0060b07d54f177f5f24a3d58b76a24d1854a463d93e43db0918bffedda0d713d0a7d836f47310d10d14f8294f25526b335d68c25f77be92d9758fbb116246fd1572bb97d77a363e23b66ba005b0132b6df36cb686e446ff61b243d4193091a0f61efa9112d8b220", 'hex');
    const iv = Buffer.from('W25/yzadEQNeV7jnZ3dnbA==', 'base64');

    beforeEach(() => {
        sinon.reset();
    });

    it('can derive session key', () => {
        const result = dataDecryptor.deriveSessionKey(key);
        expect(result.toString('hex').toUpperCase()).to.be.equal('E822A13D5D84C98BBCE10DB0A322EA2823F5A2B2B2AD8F2CE6D3683B71AACA0F');
    });

    it('can decrypt value with session key and iv', () => {
        keyRepository.getKeys.returns({
          publicKey: key,
          iv: iv
        });
        const value = Buffer.from('fWjIpGyUPmU7JxL2Zh3qqQTRjg==', 'base64');

        const result = dataDecryptor.decrypt('businessKey', value);
        expect(result.toString("base64")).to.equal('REFU');
        sinon.assert.calledOnce(keyRepository.getKeys);
    })
    it('returns encrypted value if no keys are found', () => {
        const value = Buffer.from('fWjIpGyUPmU7JxL2Zh3qqQTRjg==', 'base64');

        const result = dataDecryptor.decrypt('businessKey', value);
        expect(result).to.be.equal(value);
        sinon.assert.calledOnce(keyRepository.getKeys);
    })

    it('can encrypt and decrypt a value', () => {
        keyRepository.getKeys.returns({
          publicKey: key,
          iv: iv
        });
        const clearText = 'My very secret message';

        const encrypted = dataDecryptor.encrypt('businessKey', clearText);

        const decrypted = dataDecryptor.decrypt('businessKey', encrypted);

        expect(decrypted.toString()).to.equal(clearText);
        sinon.assert.calledTwice(keyRepository.getKeys);
    });

    it('creates keys when none are found for a business process', () => {
        const result = dataDecryptor.ensureKeys('businessKey');

        expect(result.iv).not.to.be.null;
        expect(result.publicKey).not.to.be.null;

        sinon.assert.calledOnce(keyRepository.getKeys);
        sinon.assert.calledOnce(keyRepository.putKeys);
    });
});
