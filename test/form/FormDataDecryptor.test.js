import {formDataDecryptor, expect} from '../setUpTests';
import * as forms from '../forms';

const metadata = {
  publicKey: Buffer.from("BI7a9g2LvU9b0RtK/Euk5ge0yG3ZeYBI1PAGCwfVTxd/XySj1Yt2ok0YVKRj2T5D2wkYv/7doNcT0KfYNvRzENENFPgpTyVSazNdaMJfd76S2XWPuxFiRv0VcruX13o2PiO2a6AFsBMrbfNstobkRv9hskPUGTCRoPYe+pES2LIg", 'base64'),
  iv: Buffer.from('W25/yzadEQNeV7jnZ3dnbA==', 'base64'),
};

const dataContext = {
    processContext: {
        encryptionMetaData: metadata
    }
};
const submissionContext = {
    encryptionMetaData: metadata
}

const noEncryption = {
    field1: 'foo',
    field2: 'bar'
};

const encryption = {
    encryptedFields: ['field1', 'field2'],
    field1: 'dFDfM14f866mV02tjebZeLHnwoYn0peyN/w2',
    field2: 'dFDfM14f866mV02tjebZeLHnwoYn0peyN/w2',
    field3: 'baz',
}

const nestedEncryption = {
    nested: {
        encryptedFields: ['field1', 'field2'],
        field1: 'dFDfM14f866mV02tjebZeLHnwoYn0peyN/w2',
        field2: 'dFDfM14f866mV02tjebZeLHnwoYn0peyN/w2',
    },
    field1: 'foo',
}

const arrayEncryption = {
    nested: [{
        encryptedFields: ['field1', 'field2'],
        field1: 'dFDfM14f866mV02tjebZeLHnwoYn0peyN/w2',
        field2: 'dFDfM14f866mV02tjebZeLHnwoYn0peyN/w2',
    },{
        encryptedFields: ['field1'],
        field1: 'dFDfM14f866mV02tjebZeLHnwoYn0peyN/w2',
        field2: 'bar',
    }],
    field1: 'foo',
}

const invalidEncryption = {
    encryptedFields: ['field1'],
    field1: 'M14f866mV02tjebZeLHnwoYn0peyN/w2',
};

describe('Form data encryption', () => {
  describe('Decrypting form data', () => {
    it('should decrypt data', () => {
        formDataDecryptor.decryptFormData(encryption, dataContext);

        expect(encryption.field1).to.equal('MyClearText');
        expect(encryption.field2).to.equal('MyClearText');
        expect(encryption.field3).to.equal('baz');
    });

    it('should pass through unencrypted data', () => {
        formDataDecryptor.decryptFormData(noEncryption, dataContext);

        expect(noEncryption.field1).to.equal('foo');
        expect(noEncryption.field2).to.equal('bar');
    });
    it('should decrypted nested fields', () => {
        formDataDecryptor.decryptFormData(nestedEncryption, dataContext);

        expect(nestedEncryption.nested.field1).to.equal('MyClearText');
        expect(nestedEncryption.nested.field2).to.equal('MyClearText');
    });
    it('should decrypt fields in arrays', () => {
        formDataDecryptor.decryptFormData(arrayEncryption, dataContext);

        expect(arrayEncryption.nested[0].field1).to.equal('MyClearText');
        expect(arrayEncryption.nested[0].field2).to.equal('MyClearText');
        expect(arrayEncryption.nested[1].field1).to.equal('MyClearText');
        expect(arrayEncryption.nested[1].field2).to.equal('bar');
    });
    it('should not decrypt data if an error occurs', () => {
        formDataDecryptor.decryptFormData(arrayEncryption, dataContext);

        expect(invalidEncryption.field1).to.equal('M14f866mV02tjebZeLHnwoYn0peyN/w2');
    });
  });
  describe('Encrypting form data', () => {
    const toEncrypt = {
        lastName: 'foo',
        firstName: 'baz',
    };
    const toEncryptNested = {
        nested: {
            lastName: 'foo',
            firstName: 'baz',
        },
        outer: 'fred'
    };
    const toEncryptNestedArray = {
        nested: [{
            lastName: 'foo',
            firstName: 'baz',
        },{
            lastName: 'foo',
            firstName: 'baz',
        }],
        outer: 'fred'
    };
    it('should encrypt sensitive fields', () => {
        formDataDecryptor.encryptFormData(forms.formWithSensitiveField, toEncrypt, submissionContext);

        expect(toEncrypt.lastName).to.equal('foo');
        expect(toEncrypt.firstName).to.equal('W0jm3TN7WCVANdCtGcJVJ9P4Zw==');
        expect(toEncrypt.encryptedFields).to.eql(['firstName']);
    });
    it('should encrypt sensitive fields in nested structures', () => {
        formDataDecryptor.encryptFormData(forms.formWithNestedSensitiveField, toEncryptNested, submissionContext);

        expect(toEncryptNested.nested.firstName).to.equal('W0jm3TN7WCVANdCtGcJVJ9P4Zw==');
        expect(toEncryptNested.nested.lastName).to.equal('X0bz6FVfHwEjwmUALK0j12jHZg==');
        expect(toEncryptNested.nested.encryptedFields).to.eql(['firstName', 'lastName']);
        expect(toEncryptNested.outer).to.equal('fred');
    });
    it('should encrypt sensitive fields in arrays', () => {
        formDataDecryptor.encryptFormData(forms.formWithNestedSensitiveArray, toEncryptNestedArray, submissionContext);

        expect(toEncryptNestedArray.nested[0].firstName).to.equal('W0jm3TN7WCVANdCtGcJVJ9P4Zw==');
        expect(toEncryptNestedArray.nested[0].lastName).to.equal('foo');
        expect(toEncryptNestedArray.nested[0].encryptedFields).to.eql(['firstName']);
        expect(toEncryptNestedArray.outer).to.equal('fred');
    });
  });
});
