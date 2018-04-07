process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../src/index');
const should = chai.should();

chai.use(chaiHttp);

describe('Health', () => {
    describe('/GET healthz', () => {
        it('it should GET status of OK', (done) => {
            chai.request(server)
                .get('/api/translation/healthz')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.include({"status": "OK"});
                    done();
                });
        });
    });
    describe ("/GET readiness", () => {
        it('it should GET ready of true', (done) => {
            chai.request(server)
                .get('/api/translation/readiness')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.include({"ready": true});
                    done();
                });
        });
    })

});