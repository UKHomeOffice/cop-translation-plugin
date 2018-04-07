process.env.NODE_ENV = 'test';

let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../src/index');
let should = chai.should();

chai.use(chaiHttp);



describe('Health', () => {
    describe('/GET healthz', () => {
        it('it should GET status of OK', (done) => {
            chai.request(server)
                .get('/api/healthz')
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
                .get('/api/readiness')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.include({"ready": true});
                    done();
                });
        });
    })

});