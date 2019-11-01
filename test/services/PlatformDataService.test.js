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

    describe('getIntegrityLeads', () => {
        it('should return the correct data when integrity leads are found successfully', async () => {
            const integrityLeads = [{
                staffid: "a4335c55-d7e9-49db-88e5-1acc2e6cff6c",
                identityid: "3fca4748-0adf-4a59-ab73-386c54fe292f",
                email: "integritylead@homeoffice.gov.uk",
                gradeid: "ca976df5-21b5-4e46-9e3f-ebb8fbec6d70",
                phone: "07123123456",
                defaultteamid: "57ba6ac8-0193-47ef-9c52-ec77f7daedb5",
                adelphi: 12345678,
                dateofleaving: null,
                defaultlocationid: 2,
                onboardprocessinstanceid: null,
                rolelabel: "bfint"
            }];
            nock('http://localhost:9000', { Authorization: 'Bearer token' })
                .log(console.log)
                .get('/v2/view_rolemembers?filter=rolelabel=eq.bfint')
                .reply(200, integrityLeads);

            const platformDataService = new PlatformDataService(config);
            const response = await platformDataService.getIntegrityLeads({ Authorization: 'Bearer token' });

            expect(response).to.deep.equal(integrityLeads);
        });

        it('should return null when an error occurs', async () => {
            nock('http://localhost:9000', { Authorization: 'Bearer token' })
                .log(console.log)
                .get('/v1/view_rolemembers?select=email&rolelabel=eq.bfint,&branchid=eq.null')
                .reply(500, 'Internal Server Error');

            const platformDataService = new PlatformDataService(config);
            const response = await platformDataService.getIntegrityLeads({ Authorization: 'Bearer token' });

            expect(response).to.equal(null);
        });
    });

    describe('getTeams', () => {
        it('should return the correct data when teams are found successfully', async () => {
            nock('http://localhost:9001', {Authorization: 'Bearer token'})
            .log(console.log)
            .get('/v1/entities/team')
            .reply(200, {
                data: [{
                    id: '018d7442-4b4e-4ff3-acc6-f2d865a6e6ad'
                }, {
                    id: 'ccbf8c53-0e54-414d-ad4a-0c3edad07515'
                }]
            });

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
