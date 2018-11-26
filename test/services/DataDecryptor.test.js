import DataDecryptor from "../../src/services/DataDecryptor";
import {expect} from 'chai';
import fs from 'fs';

describe('DataDecryptor', () => {
    const rsaKey = fs.readFileSync('test/certs/signing1.key');
    const dataDecryptor = new DataDecryptor(rsaKey);
    const key = "WqoPbVVIFP3qRfFGPqY3wPvIxiQdPNePOGBBLqqGTdI6hFIy75fIsBykTT2xGxA+rb0SmalbGjOF1IN5Mbj3kk9s9D9Sa0nAnnokkiFwVIJzhJX1EtZQgWnSgJvhb5jJesHfNV6mY+Rgp4LX5GVTQ/ZeDt8XbR0w1NzsNOova6eK4Nm4Yt3eWmEXc7E2yt8Dgj5VBnLdOqtpv6UGRJSVNzlezl9Yp0RtolIHiytT/QZeIimcVcNmvwn6lmVT4XJpD/Q4mmEFhyYuPs6xTXTO/16xBrRv/aqSY0qNKTUVnrwzQfJ7M7D5XmvaQhZ4dazeHeI9XIi/DtE6vV45Rqs1mw=="

    it('can decrypt session key', () => {
        const result = dataDecryptor.decryptSessionKey(key);
        expect(result.toString('hex').toUpperCase()).to.be.equal('9AA0F1343BE8E668C465F91DA6F925FE8F9E261D182E644C38A6D9F0AC1F3F6D');
    });

    it('can decrypt value with session key and iv', () => {

        const sessionKey = dataDecryptor.decryptSessionKey(key);
        const value = new Buffer('zp+whBVVWiNmNVlLtw2qUTCqDQ==', 'base64');
        const iv = new Buffer('W25/yzadEQNeV7jnZ3dnbA==', 'base64');

        const result = dataDecryptor.decrypt(sessionKey, value, iv);
        expect(result.toString()).to.equal('DAT');
    })
});
