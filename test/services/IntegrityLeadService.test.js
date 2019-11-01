import expect from 'expect';
import sinon from 'sinon';
import IntegrityLeadService from '../../src/services/IntegrityLeadService';
import PlatformDataService from '../../src/services/PlatformDataService';

describe('IntegrityLeadService', () => {
  let platformDataService;
  let integrityLeads;

  const staffTeamId = '15a13c2a-fa63-4437-b4b0-d6b070e9c17e';
  const teams = [{
    id: staffTeamId,
    branchid: 11
  }, {
    id: '444e92aa-16e6-41fb-9642-783532f4dd84',
    branchid: 12
  }, {
    id: 'bfb30c46-e7fa-4716-81b7-7687eef2c312',
    branchid: 12
  }];

  beforeEach(() => {
    platformDataService = sinon.createStubInstance(PlatformDataService);
    platformDataService.getTeams.returns([{
      id: staffTeamId,
      branchId: 12
    }]);
    integrityLeads = [{
      email: 'integritylead1@homeoffice.gov.uk',
      defaultteamid: staffTeamId,
    }, {
      email: 'integritylead2@homeoffice.gov.uk',
      defaultteamid: staffTeamId,
    }, {
      email: 'integritylead3@homeoffice.gov.uk',
      defaultteamid: '9f4bebae-ffd1-4a31-9cfd-2108d3a1423f',
    }];
  });

  describe('getEmails', () => {
    it('should return comma delimited emails when integrity leads are found', async () => {
      platformDataService.getIntegrityLeads.returns(integrityLeads);

      const integrityLeadService = new IntegrityLeadService(platformDataService);
      const emails = await integrityLeadService.getEmails(staffTeamId, {});

      expect(emails).toEqual('integritylead1@homeoffice.gov.uk,integritylead2@homeoffice.gov.uk');
    });

    it('should return an empty string when integrity leads are not found', async () => {
      platformDataService.getIntegrityLeads.returns([integrityLeads.pop()]);

      const integrityLeadService = new IntegrityLeadService(platformDataService);
      const emails = await integrityLeadService.getEmails(staffTeamId, {});

      expect(emails).toEqual('');
    });
  });

  describe('staffTeam', () => {
    it('should return the correct team for a staff member', () => {
      const integrityLeadService = new IntegrityLeadService(platformDataService);
      const staffTeam = integrityLeadService.staffTeam(teams, staffTeamId);

      expect(staffTeam).toEqual({
        id: staffTeamId,
        branchid: 11
      });
    });

    it('should return undefined when a team is not found for a staff member', () => {
      const integrityLeadService = new IntegrityLeadService(platformDataService);
      const staffTeam = integrityLeadService.staffTeam(teams, 20);

      expect(staffTeam).toEqual(undefined);
    });
  });

  describe('branchTeamIds', () => {
    it('should return the correct teams for a branch', () => {
      const integrityLeadService = new IntegrityLeadService(platformDataService);
      const branchTeamIds = integrityLeadService.branchTeamIds(teams, 12);

      expect(branchTeamIds).toEqual([
        '444e92aa-16e6-41fb-9642-783532f4dd84',
        'bfb30c46-e7fa-4716-81b7-7687eef2c312'
      ]);
    });

    it('should return an empty array when teams cannot be found for a branch', () => {
      const integrityLeadService = new IntegrityLeadService(platformDataService);
      const branchTeamIds = integrityLeadService.branchTeamIds(teams, 21);

      expect(branchTeamIds).toEqual([]);
    });
  });

  describe('emails', () => {
    it('should return comma delimited emails for the integrity leads', () => {
      const integrityLeadService = new IntegrityLeadService(platformDataService);
      const emails = integrityLeadService.emails(integrityLeads, [staffTeamId]);

      expect(emails).toEqual('integritylead1@homeoffice.gov.uk,integritylead2@homeoffice.gov.uk');
    });

    it('should return an empty string when integrity leads cannot be found', () => {
      const branchTeamIds = ['2d97b103-67d3-46f9-8d1f-d7be8f90f2ec'];
      const integrityLeadService = new IntegrityLeadService(platformDataService);
      const emails = integrityLeadService.emails(integrityLeads, branchTeamIds);

      expect(emails).toEqual('');
    });
  });
});
