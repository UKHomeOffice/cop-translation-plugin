process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../src/index');
const should = chai.should();

chai.use(chaiHttp);

describe('Form Data Resolution', () => {
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