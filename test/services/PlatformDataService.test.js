import PlatformDataService from '../../src/services/PlatformDataService';
import nock from 'nock';
import { expect } from '../setUpTests';

describe('PlatformDataService', () => {
    const config = {
        services: {
            operationalData: {
                url: 'http://localhost:9000'
            },
            referenceData: {
                url: 'http://localhost:9001'
            }
        }
    };

    afterEach(() => {
        nock.cleanAll();
    });

    describe('getIntegrityLeadEmails', () => {
        it('should return the correct data when integrity leads are found successfully', async () => {
            nock('http://localhost:9000', { Authorization: 'Bearer token' })
            .log(console.log)
            .post('/v1/rpc/rolemembers')
            .reply(200, [{
                email: 'integritylead1@homeoffice.gov.uk'
            }, {
                email: 'integritylead2@homeoffice.gov.uk'
            }]);

            const platformDataService = new PlatformDataService(config);
            const response = await platformDataService.getIntegrityLeadEmails(10, { Authorization: 'Bearer token' });

            expect(response).to.deep.equal([
                'integritylead1@homeoffice.gov.uk',
                'integritylead2@homeoffice.gov.uk'
            ]);
        });

        it('should return null when an error occurs', async () => {
            nock('http://localhost:9000', { Authorization: 'Bearer token' })
                .log(console.log)
                .get('/v1/view_rolemembers?select=email&rolelabel=eq.bfint,&branchid=eq.null')
                .reply(500, 'Internal Server Error');

            const platformDataService = new PlatformDataService(config);
            const response = await platformDataService.getIntegrityLeadEmails(null, { Authorization: 'Bearer token' });

            expect(response).to.equal(null);
        });
    });

    describe('getTeams', () => {
        it('should return the correct data when teams are found successfully', async () => {
            nock('http://localhost:9001', {Authorization: 'Bearer token'})
            .log(console.log)
            .get('/v1/entities/team')
            .reply(200, [{
                id: '018d7442-4b4e-4ff3-acc6-f2d865a6e6ad'
            }, {
                id: 'ccbf8c53-0e54-414d-ad4a-0c3edad07515'
            }]);

            const platformDataService = new PlatformDataService(config);
            const response = await platformDataService.getTeams({ Authorization: 'Bearer token' });

            expect(response).to.deep.equal([{
                id: '018d7442-4b4e-4ff3-acc6-f2d865a6e6ad'
            }, {
                id: 'ccbf8c53-0e54-414d-ad4a-0c3edad07515'
            }]);
        });

        it('should return null when an error occurs', async () => {
            nock('http://localhost:9001', { Authorization: 'Bearer token' })
                .log(console.log)
                .get('/v1/entities/team')
                .reply(500, 'Internal Server Error');

            const platformDataService = new PlatformDataService(config);
            const response = await platformDataService.getTeams({ Authorization: 'Bearer token' });

            expect(response).to.equal(null);
        });
    });
});
