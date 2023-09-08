package com.inventage.keycloak.reenterpasswordauthenticator.infrastructure.token;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.keycloak.authentication.actiontoken.DefaultActionToken;

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
                        String compoundAuthenticationSessionId,
                        String payload,
                        String credential,
                        String username
    ) {
        super(userId, TOKEN_TYPE, absoluteExpirationInSecs, null, compoundAuthenticationSessionId);
        this.payload = payload;
        this.credential = credential;
        this.username = username;
    }

    private PayloadToken() {
        // Required to deserialize from JWT
        super();
    }
}
