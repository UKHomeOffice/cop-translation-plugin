import {dataDecryptor, formDataDecryptor, expect} from '../setUpTests';

const dataContext = {
    processContext: {
        businessKey: 'hardcodedBusinessKey'
    }
};

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
