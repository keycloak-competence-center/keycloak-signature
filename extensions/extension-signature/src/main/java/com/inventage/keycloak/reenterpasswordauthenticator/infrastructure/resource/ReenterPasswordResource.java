package com.inventage.keycloak.reenterpasswordauthenticator.infrastructure.resource;

import com.inventage.keycloak.reenterpasswordauthenticator.infrastructure.record.SignRequest;
import com.inventage.keycloak.reenterpasswordauthenticator.infrastructure.token.PayloadToken;
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

public class ReenterPasswordResource {

    private static final Logger LOGGER = Logger.getLogger(ReenterPasswordResource.class);

    final KeycloakSession session;

    public ReenterPasswordResource(KeycloakSession session) {
        this.session = session;
    }

    @GET
    @Path("")
    @NoCache
    @Produces(MediaType.TEXT_HTML)
    public Response getPage(@QueryParam("payload") String description) {
        // TODO: check redirect uri
        // TODO: check if correct realm

        LOGGER.debugf("getPage");
        final InputStream indexHtml = this.getClass().getClassLoader().getResourceAsStream("theme/signature/templates/index.html");
        final Response.ResponseBuilder responseBuilder = Response.ok(indexHtml).cacheControl(CacheControlUtil.getDefaultCacheControl());
        return responseBuilder.build();
    }

    @GET
    @Path("keycloak-signature.bundled.js")
    @NoCache
    @Produces("application/javascript")
    public Response getKeycloakSignatureJSFile() {
        // TODO: check redirect uri
        // TODO: check if correct realm
        // TODO: static content https://stackoverflow.com/questions/70714152/how-to-serve-static-files-from-file-system-with-quarkus

        LOGGER.debugf("getKeycloakSignatureJSFile");
        final InputStream indexHtml = this.getClass().getClassLoader().getResourceAsStream("theme/signature/resources/js/keycloak-signature.bundled.js");
        final Response.ResponseBuilder responseBuilder = Response.ok(indexHtml).cacheControl(CacheControlUtil.getDefaultCacheControl());
        return responseBuilder.build();
    }

    @POST
    @Path("/sign")
    @NoCache
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response sign(SignRequest signRequest) {
        // TODO: check password
        // TODO: sign payload, ...
        // TODO: CORS
        LOGGER.debugf("sign");
        LOGGER.debugf("sign (signRequest): " + signRequest);
        final String signedPayload = "{\"signedPayload\": \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c\"}";
        final JsonObject token = getJwtToken(session.getContext().getHttpRequest());
        if (token == null) {
            return Response.status(401).build();
        }

        if (!isSessionActiveAndPasswordValid(signRequest, token)) {
            LOGGER.debugf("sign: no active session or password is incorrect");
            return Response.status(401).build();
        }

        LOGGER.debugf("sign: correct password");

        final UserModel userModel = getUserModel(token);

        if (userModel == null) {
            LOGGER.debugf("sign: no active session");
            return Response.status(401).build();
        }

        // TODO: check if credentials contains an element
        final PayloadToken payloadToken = new PayloadToken(
                userModel.getId(),
                Time.currentTime() + 3600,
                "signPayload",
                signRequest.payload(),
                signRequest.credentials().keySet().stream().toList().get(0),
                userModel.getUsername()
        );

        final String signedPayloadToken = payloadToken.serialize(session, session.getContext().getRealm(), session.getContext().getUri());
        final JsonObject signedPayloadJson = JsonObject.of("signedPayload", signedPayloadToken);

        final Response.ResponseBuilder responseBuilder = Response
                .ok()
                .header("signature", signedPayload)
                .entity(signedPayloadJson);
        return responseBuilder.build();
    }

    private boolean isSessionActiveAndPasswordValid(SignRequest signRequest, JsonObject token) {
        final UserModel user = getUserModel(token);
        if (user == null) return false;

        String password = signRequest.credentials().get("password");

        return password != null && user.credentialManager().isValid(UserCredentialModel.password(password));
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

    @OPTIONS
    @Path("/sign")
    @NoCache
    public Response signOptions() {
        // TODO: CORS
        // TODO: Headers
        LOGGER.debugf("signOptions");
        final Response.ResponseBuilder responseBuilder = Response.ok();
        return responseBuilder.build();
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
