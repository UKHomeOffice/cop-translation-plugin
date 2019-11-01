class IntegrityLeadService {
  constructor(platformDataService) {
    this.platformDataService = platformDataService;
  }

  async getEmails(staffTeamId, headers) {
    const teams = await this.platformDataService.getTeams(headers);
    const staffTeam = this.staffTeam(teams, staffTeamId);
    const branchTeamIds = this.branchTeamIds(teams, staffTeam.branchid);
    const integrityLeads = await this.platformDataService.getIntegrityLeads(headers);
    return this.emails(integrityLeads, branchTeamIds);
  }

  staffTeam(teams, staffTeamId) {
    return teams
      .filter(team => team.id === staffTeamId)[0];
  }

  branchTeamIds(teams, staffBranchId) {
    return teams
      .filter(team => team.branchid === staffBranchId)
      .map(team => team.id);
  }

  emails(integrityLeads, branchTeamIds) {
    return integrityLeads
      .filter(integrityLead => branchTeamIds.includes(integrityLead.defaultteamid))
      .map(integrityLead => integrityLead.email)
      .join();
  }
}

export default IntegrityLeadService;
