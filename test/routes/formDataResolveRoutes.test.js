process.env.NODE_ENV = 'test';
process.env.SESSION_SECRET="test";
process.env.SESSION_NAME="test";
process.env.PRIVATE_KEY_PATH="test/certs/signing1.key";

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../src/index');
chai.should();
chai.use(chaiHttp);

describe('Form Data Routes Resolution', () => {
    describe('/GET forms', () => {
        it('it should GET 403 as not authenticated', (done) => {
            chai.request(server)
                .get('/api/translation/form/423423')
                .end((err, res) => {
                    res.should.have.status(403);
                    done();
                });
        });
    });
});
