import KeyRepository from "../../src/services/KeyRepository";
import {expect} from 'chai';

describe('KeyRepository', () => {
    const keyRepository = new KeyRepository();

    it('should return null if no keys available for a business key', () => {
        const result = keyRepository.getKeys("businessKey");

        expect(result).to.be.null;
    });
    it('should return keys for a business key', () => {
        const iv = Buffer.from('erty', 'base64');
        const publicKey = Buffer.from('sdfr', 'base64');
        keyRepository.putKeys('businessKey', publicKey, iv);

        const result = keyRepository.getKeys("businessKey");
        expect(result).not.to.be.null;
        expect(result.publicKey).to.be.equal(publicKey);
        expect(result.iv).to.be.equal(iv);
    });
});
