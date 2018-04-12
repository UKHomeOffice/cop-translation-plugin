class KeycloakContext {
    constructor(kauth) {
        this.accessToken = kauth.grant.access_token.token;
        const content = kauth.grant.access_token.content;
        this.sessionId = content.session_state;
        this.email = content.email;
        this.userName = content.preferred_username;
        this.givenName = content.given_name;
        this.familyName = content.family_name;
    }
}

export default KeycloakContext;