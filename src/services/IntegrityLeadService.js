class IntegrityLeadService {
  constructor(platformDataService) {
    this.platformDataService = platformDataService;
    this.fallbackTeamList = ['bd92915e-9192-414a-93af-988fa201d551'];
    this.filterFields = ['branchid', 'directorateid', 'departmentid'];
  }

  async getEmails(staffTeamId, headers) {
    const teams = await this.platformDataService.getTeams(headers);
    const integrityLeads = await this.platformDataService.getIntegrityLeads(headers);
    const staffTeam = this.staffTeam(teams, staffTeamId);
    let teamIds = this.filterTeamsById(teams, staffTeam);
    teamIds = this.fallbackTeamIds(teamIds);
    return this.emails(integrityLeads, teamIds);
  }

  staffTeam(teams, staffTeamId) {
    return teams
      .filter(team => team.id === staffTeamId)[0];
  }

  filterTeams(teams, matchField, staffFieldValue) {
    return teams
      .filter(team => team[matchField] !== null)
      .filter(team => team[matchField] === staffFieldValue)
      .map(team => team.id);
  }

  filterTeamsById(teams, staffTeam) {
    let teamIds = [];

    this.filterFields.forEach(field => {
      if (teamIds.length === 0) {
        teamIds = this.filterTeams(teams, field, staffTeam[field]);
      }
    });

    return teamIds;
  }

  fallbackTeamIds(teamIds) {
    return teamIds.length > 0 ? teamIds : this.fallbackTeamList;
  }

  emails(integrityLeads, teamIds) {
    return integrityLeads
      .filter(integrityLead => teamIds.includes(integrityLead.defaultteamid))
      .map(integrityLead => integrityLead.email)
      .join();
  }
}

export default IntegrityLeadService;
