process.env.NODE_ENV = 'test';
process.env.PRIVATE_KEY_PATH="test/certs/signing1.key";

import * as logger from 'winston';
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../src/index');
chai.should();
chai.use(chaiHttp);

describe('Health Routes', () => {
    describe('/GET healthz', () => {
        it('it should return a boyd of {status:OK}', (done) => {
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
        it('it should return a body of {ready:true}', (done) => {
            chai.request(server)
                .get('/api/translation/readiness')
                .end((err, res) => {
                    logger.info(JSON.stringify(res));
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.include({"ready": true});
                    done();
                });
        });
    })

});
