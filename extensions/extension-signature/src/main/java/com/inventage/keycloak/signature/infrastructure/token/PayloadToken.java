package com.inventage.keycloak.signature.infrastructure.token;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.ws.rs.core.UriInfo;
import org.keycloak.TokenCategory;
import org.keycloak.authentication.actiontoken.DefaultActionToken;
import org.keycloak.common.util.Time;
import org.keycloak.models.KeycloakSession;
import org.keycloak.models.RealmModel;
import org.keycloak.services.Urls;

/**
 * Custom Token
 */
public class PayloadToken extends DefaultActionToken {

    public static final String TOKEN_TYPE = "signed-payload-token";

    private static final String PAYLOAD_FIELD = "payload";
    private static final String USERNAME_FIELD = "username";
    private static final String CREDENTIALS_FIELD = "credential";

    @JsonProperty(value = PAYLOAD_FIELD)
    private String payload;

    @JsonProperty(value = USERNAME_FIELD)
    private String username;

    @JsonProperty(value = CREDENTIALS_FIELD)
    private String credential;

    public PayloadToken(String userId,
                        int absoluteExpirationInSecs,
                        String payload,
                        String credential,
                        String username
    ) {
        super(userId, TOKEN_TYPE, absoluteExpirationInSecs, null, null);
        this.payload = payload;
        this.credential = credential;
        this.username = username;
    }

    private PayloadToken() {
        // Required to deserialize from JWT
        super();
    }

    @Override
    public String serialize(KeycloakSession session, RealmModel realm, UriInfo uri) {
        String issuerUri = getIssuer(realm, uri);

        this.iat((long) Time.currentTime())
            .id(getActionVerificationNonce().toString())
            .issuer(issuerUri)
            .exp(null); // remove expiration from token

        return session.tokens().encode(this);
    }

    @Override
    public TokenCategory getCategory() {
        return TokenCategory.ACCESS;
    }

    private static String getIssuer(RealmModel realm, UriInfo uri) {
        return Urls.realmIssuer(uri.getBaseUri(), realm.getName());
    }
}
