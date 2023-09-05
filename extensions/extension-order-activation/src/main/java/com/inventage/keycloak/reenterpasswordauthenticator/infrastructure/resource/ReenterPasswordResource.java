package com.inventage.keycloak.reenterpasswordauthenticator.infrastructure.resource;

import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.jboss.logging.Logger;
import org.jboss.resteasy.annotations.cache.NoCache;
import org.keycloak.services.util.CacheControlUtil;

import java.io.FileInputStream;
import java.io.InputStream;
import java.net.URI;

public class ReenterPasswordResource {

    private static final Logger LOGGER = Logger.getLogger(ReenterPasswordResource.class);

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
    public Response sign(@HeaderParam("Content-Type") String contentType) {
        // TODO: check password
        // TODO: sign payload, ...
        // TODO: CORS
        LOGGER.debugf("activateOrder/redirect");
        LOGGER.debugf("activateOrder/redirect: " + contentType);
        final String signedPayload = "{\"signedPayload\": \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c\"}";

        final Response.ResponseBuilder responseBuilder = Response.ok().header("signature", signedPayload).entity(signedPayload);
        return responseBuilder.build();
    }

    @OPTIONS
    @Path("/sign")
    @NoCache
    public Response singOptions() {
        // TODO: CORS
        // TODO: Headers
        final Response.ResponseBuilder responseBuilder = Response.ok();
        return responseBuilder.build();
    }

    private String getHtmlPage(String redirectUri, String description) {
        return String.format(
                """
             <!DOCTYPE html>
             <html>
             <head>
             <title>Activate Order</title>
             </head>
             <body>
             <h1>Activate Order</h1>
             <p>This page is still in development</p>
             <p> description parameter: '%s' </p>
             <button onclick="redirect('%s','%s')">click to redirect</button>
             <script>
             
             function redirect(uri, description) {
             	window.location.href = 'activate_order/redirect?redirect_uri=' + uri + '&signature= ' + description;
             }

                         </script>
                         </body>
                         </html>
                         
                        """,
          description,
          redirectUri,
          description
        );
    }
}
