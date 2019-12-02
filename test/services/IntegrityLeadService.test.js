import expect from 'expect';
import sinon from 'sinon';
import IntegrityLeadService from '../../src/services/IntegrityLeadService';
import PlatformDataService from '../../src/services/PlatformDataService';

describe('IntegrityLeadService', () => {
  let platformDataService;
  let integrityLeads;
  let teams;

  const staffTeamId = '15a13c2a-fa63-4437-b4b0-d6b070e9c17e';

  beforeEach(() => {
    platformDataService = sinon.createStubInstance(PlatformDataService);
    platformDataService.getTeams.returns([{
      id: staffTeamId,
      branchid: 12
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
    teams = [{
      id: staffTeamId,
      branchid: 11
    }, {
      id: '444e92aa-16e6-41fb-9642-783532f4dd84',
      branchid: 12
    }, {
      id: 'bfb30c46-e7fa-4716-81b7-7687eef2c312',
      branchid: 12
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

  describe('filterTeams', () => {
    it('should return the correct teams for a branch', () => {
      const integrityLeadService = new IntegrityLeadService(platformDataService);
      const teamIds = integrityLeadService.filterTeams(teams, 'branchid', 12);

      expect(teamIds).toEqual([
        '444e92aa-16e6-41fb-9642-783532f4dd84',
        'bfb30c46-e7fa-4716-81b7-7687eef2c312'
      ]);
    });

    it('should return an empty array when teams cannot be found for a branch', () => {
      const integrityLeadService = new IntegrityLeadService(platformDataService);
      const teamIds = integrityLeadService.filterTeams(teams, 'branchid', 21);

      expect(teamIds).toEqual([]);
    });

    it('should not return a match when both team branch id and the staff branch id are null', () => {
      teams[2].branchid = null;

      const integrityLeadService = new IntegrityLeadService(platformDataService);
      const teamIds = integrityLeadService.filterTeams(teams, 'branchid', null);

      expect(teamIds).toEqual([]);
    });
  });

  describe('filterTeamsById', () => {
    it('should return the correct teams filtered by branch when given a branch, directorate and department', () => {
      teams = [{
        id: staffTeamId,
        branchid: 11,
        directorateid: 12,
        departmentid: 17
      }, {
        id: '2af51406-a1c2-4c2d-8475-462564ada449',
        branchid: 11,
        directorateid: 14,
        departmentid: 12
      }, {
        id: '444e92aa-16e6-41fb-9642-783532f4dd84',
        branchid: 12,
        directorateid: 16,
        departmentid: 18
      }, {
        id: 'bfb30c46-e7fa-4716-81b7-7687eef2c312',
        branchid: 12,
        directorateid: 16,
        departmentid: 18
      }];

      const integrityLeadService = new IntegrityLeadService(platformDataService);
      const teamIds = integrityLeadService.filterTeamsById(teams, { branchid: 12 });

      expect(teamIds).toEqual([
        '444e92aa-16e6-41fb-9642-783532f4dd84',
        'bfb30c46-e7fa-4716-81b7-7687eef2c312'
      ]);
    });

    it('should return the correct teams filtered by directorate when not given a branch', () => {
      teams = [{
        id: staffTeamId,
        branchid: null,
        directorateid: 14
      }, {
        id: '444e92aa-16e6-41fb-9642-783532f4dd84',
        branchid: 12,
        directorateid: 16
      }, {
        id: 'bfb30c46-e7fa-4716-81b7-7687eef2c312',
        branchid: null,
        directorateid: 16
      }];

      const integrityLeadService = new IntegrityLeadService(platformDataService);
      const teamIds = integrityLeadService.filterTeamsById(teams, { directorateid: 16 });

      expect(teamIds).toEqual([
        'bfb30c46-e7fa-4716-81b7-7687eef2c312'
      ]);
    });

    it('should return the correct teams filtered by department when not given a branch or directorate', () => {
      teams = [{
        id: staffTeamId,
        branchid: 12,
        directorateid: null,
        departmentid: 17
      }, {
        id: '444e92aa-16e6-41fb-9642-783532f4dd84',
        branchid: null,
        directorateid: 16,
        departmentid: 18
      }, {
        id: 'bfb30c46-e7fa-4716-81b7-7687eef2c312',
        branchid: null,
        directorateid: null,
        departmentid: 18
      }];

      const integrityLeadService = new IntegrityLeadService(platformDataService);
      const teamIds = integrityLeadService.filterTeamsById(teams, { departmentid: 18 });

      expect(teamIds).toEqual([
        'bfb30c46-e7fa-4716-81b7-7687eef2c312',
        ...integrityLeadService.fallbackTeamList
      ]);
    });
  });

  describe('fallbackTeamIds', () => {
    it('should return the team ids when given team ids', () => {
      const teamIds = [
        '444e92aa-16e6-41fb-9642-783532f4dd84',
        'bfb30c46-e7fa-4716-81b7-7687eef2c312'
      ];
      const integrityLeadService = new IntegrityLeadService(platformDataService);
      const ids = integrityLeadService.fallbackTeamIds(teamIds);

      expect(ids).toEqual(teamIds);
    });

    it('should return the fallback team id when not given team ids', () => {
      const teamIds = [];
      const integrityLeadService = new IntegrityLeadService(platformDataService);
      const ids = integrityLeadService.fallbackTeamIds(teamIds);

      expect(ids).toEqual(integrityLeadService.fallbackTeamList);
    });
  });

  describe('emails', () => {
    it('should return comma delimited emails for the integrity leads', () => {
      const integrityLeadService = new IntegrityLeadService(platformDataService);
      const emails = integrityLeadService.emails(integrityLeads, [staffTeamId]);

      expect(emails).toEqual('integritylead1@homeoffice.gov.uk,integritylead2@homeoffice.gov.uk');
    });

    it('should return an empty string when integrity leads cannot be found', () => {
      const teamIds = ['2d97b103-67d3-46f9-8d1f-d7be8f90f2ec'];
      const integrityLeadService = new IntegrityLeadService(platformDataService);
      const emails = integrityLeadService.emails(integrityLeads, teamIds);

      expect(emails).toEqual('');
    });
  });
});
