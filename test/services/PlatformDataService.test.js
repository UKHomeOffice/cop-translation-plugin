import PlatformDataService from '../../src/services/PlatformDataService';
import nock from 'nock';
import { expect } from '../setUpTests';

describe('PlatformDataService', () => {
    describe('getIntegrityLeadEmails', () => {
        it('should return the correct data when integrity leads are found successfully', async () => {
            nock('http://localhost:9000', {Authorization: 'Bearer token'})
            .log(console.log)
            .get('/v1/view_rolemembers?select=email&rolelabel=eq.bfint,&branchid=eq.10')
            .reply(200, [{
                email: 'integritylead1@homeoffice.gov.uk'
            }, {
                email: 'integritylead2@homeoffice.gov.uk'
            }]);

            const config = {
                services: {
                    operationalData: {
                        url: 'http://localhost:9000'
                    }
                }
            };

            const platformDataService = new PlatformDataService(config);
            const response = await platformDataService.getIntegrityLeadEmails(10, {Authorization: 'Bearer token'});

            expect(response).to.deep.equal([
                'integritylead1@homeoffice.gov.uk',
                'integritylead2@homeoffice.gov.uk'
            ]);
        });

        it('should return null when an error occurs', async () => {
            nock('http://localhost:9000', {Authorization: 'Bearer token'})
                .log(console.log)
                .get('/v1/view_rolemembers?select=email&rolelabel=eq.bfint,&branchid=eq.null')
                .reply(500, 'Internal Server Error');

            const config = {
                services: {
                    operationalData: {
                        url: 'http://localhost:9000'
                    }
                }
            };

            const platformDataService = new PlatformDataService(config);
            const response = await platformDataService.getIntegrityLeadEmails(null, {Authorization: 'Bearer token'});

            expect(response).to.equal(null);
        });
    });
});
