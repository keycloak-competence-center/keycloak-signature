package com.inventage.keycloak.signature.infrastructure.resource;

import com.inventage.keycloak.signature.infrastructure.record.SignRequest;
import com.inventage.keycloak.signature.infrastructure.token.PayloadToken;
import io.vertx.core.json.Json;
import io.vertx.core.json.JsonObject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Cookie;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.jboss.logging.Logger;
import org.jboss.resteasy.annotations.cache.NoCache;
import org.keycloak.common.util.Time;
import org.keycloak.http.HttpRequest;
import org.keycloak.models.KeycloakSession;
import org.keycloak.models.UserCredentialModel;
import org.keycloak.models.UserModel;
import org.keycloak.models.UserSessionModel;
import org.keycloak.services.managers.AuthenticationManager;
import org.keycloak.services.util.CacheControlUtil;

import java.io.InputStream;
import java.util.Base64;

/**
 * Resource class providing endpoints for fetching the page and calling the signing procedure
 */
public class SignatureResource {

    private static final Logger LOGGER = Logger.getLogger(SignatureResource.class);

    final KeycloakSession session;

    public SignatureResource(KeycloakSession session) {
        this.session = session;
    }

    /**
     * Endpoint in order to create a JWT which includes an arbitrary payload.
     * The user calling this endpoint has to be in a session.
     *
     * @param signRequest Record of type {@code SignRequest}
     * @return In case of correct credentials and valid session it will return an OK (200) response with the signed JWT ({@code PayloadToken})
     * else it returns a Forbidden (403) response
     */
    @POST
    @Path("/sign")
    @NoCache
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response sign(SignRequest signRequest) {
        LOGGER.debugf("sign: /sign (POST) endpoint called");

        AuthenticationManager.AuthResult authResult = AuthenticationManager.authenticateIdentityCookie(session,
                session.getContext().getRealm(), true);

        if (authResult == null || authResult.getUser() == null) {
            LOGGER.debugf("sign: No active session present");
            return Response.status(403).build();
        }

        final UserModel userModel = authResult.getUser();
        if (!isPasswordValid(signRequest, userModel)) {
            LOGGER.debugf("sign: Password is incorrect");
            return Response.status(403).build();
        }

        final JsonObject signedPayloadJson = createAndSerializeToken(signRequest, userModel);
        final Response.ResponseBuilder responseBuilder = Response
                .ok()
                .entity(signedPayloadJson);
        return responseBuilder.build();
    }

    private JsonObject createAndSerializeToken(SignRequest signRequest, UserModel userModel) {
        final PayloadToken payloadToken = new PayloadToken(
                userModel.getId(),
                Time.currentTime() + 3600,
                signRequest.payload(),
                signRequest.credentials().keySet().stream().toList().get(0),
                userModel.getUsername()
        );

        final String signedPayloadToken = payloadToken.serialize(session, session.getContext().getRealm(), session.getContext().getUri());
        return JsonObject.of("signedPayload", signedPayloadToken);
    }

    private boolean isPasswordValid(SignRequest signRequest, UserModel userModel) {
        String password = signRequest.credentials().get("password");
        return password != null && userModel.credentialManager().isValid(UserCredentialModel.password(password));
    }
}
