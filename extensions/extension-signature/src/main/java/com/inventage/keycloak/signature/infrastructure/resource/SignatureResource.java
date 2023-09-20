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

public class SignatureResource {

    private static final Logger LOGGER = Logger.getLogger(SignatureResource.class);

    final KeycloakSession session;

    public SignatureResource(KeycloakSession session) {
        this.session = session;
    }

    @GET
    @Path("")
    @NoCache
    @Produces(MediaType.TEXT_HTML)
    public Response getPage(@QueryParam("payload") String description) {
        // TODO: check if correct realm
        LOGGER.debugf("getPage: / endpoint called");
        final InputStream indexHtml = this.getClass().getClassLoader().getResourceAsStream("theme/signature/templates/index.html");
        final Response.ResponseBuilder responseBuilder = Response.ok(indexHtml).cacheControl(CacheControlUtil.getDefaultCacheControl());
        return responseBuilder.build();
    }

    @POST
    @Path("/sign")
    @NoCache
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response sign(SignRequest signRequest) {
        // TODO: CORS
        LOGGER.debugf("sign: /sign (POST) endpoint called");

        final JsonObject token = getJwtToken(session.getContext().getHttpRequest());
        if (token == null) {
            LOGGER.debugf("sign: no token provided");
            return Response.status(403).build();
        }

        final UserModel userModel = getUserModel(token);
        if (!isSessionActiveAndPasswordValid(signRequest, userModel)) {
            LOGGER.debugf("sign: no active session or password is incorrect");
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

    private boolean isSessionActiveAndPasswordValid(SignRequest signRequest, UserModel userModel) {
        if (userModel == null) {
            return false;
        }

        //TODO: add support for other authentication methods
        String password = signRequest.credentials().get("password");
        return password != null && userModel.credentialManager().isValid(UserCredentialModel.password(password));
    }

    private UserModel getUserModel(JsonObject token) {
        final UserSessionModel userSessionModel = session
            .sessions()
            .getUserSession(
                session.getContext().getRealm(),
                token.getString("sid")
            );

        if (userSessionModel == null) {
            return null;
        }

        final UserModel user = userSessionModel.getUser();
        return user;
    }

    private JsonObject getJwtToken(HttpRequest request) {
        final Cookie cookie = request.getHttpHeaders().getCookies().get(AuthenticationManager.KEYCLOAK_IDENTITY_COOKIE);

        if (cookie != null) {
            final String jwt = cookie.getValue();
            final String claims = new String(Base64.getUrlDecoder().decode(jwt.split("\\.")[1]));
            return (JsonObject) Json.decodeValue(claims);
        }

        return null;
    }
}
