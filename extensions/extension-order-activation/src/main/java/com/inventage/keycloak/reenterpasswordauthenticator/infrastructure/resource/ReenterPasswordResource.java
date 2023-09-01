package com.inventage.keycloak.reenterpasswordauthenticator.infrastructure.resource;

import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.jboss.logging.Logger;
import org.jboss.resteasy.annotations.cache.NoCache;
import org.keycloak.services.util.CacheControlUtil;

import java.net.URI;

public class ReenterPasswordResource {

    private static final Logger LOGGER = Logger.getLogger(ReenterPasswordResource.class);

    @GET
    @Path("")
    @NoCache
    @Produces(MediaType.TEXT_HTML)
    public Response activateOrder(@QueryParam("redirect_uri") @Encoded URI redirectUri, @QueryParam("description") String description) {
        // TODO: check redirect uri
        // TODO: check if correct realm

        LOGGER.debugf("activateOrder");
        final Response.ResponseBuilder responseBuilder = Response.ok(getHtmlPage(redirectUri.toString(), description)).cacheControl(CacheControlUtil.getDefaultCacheControl());
        return responseBuilder.build();
    }

    @GET
    @Path("/redirect")
    @NoCache
    public Response redirect(@QueryParam("redirect_uri") URI redirectUri, @QueryParam("description") String description) {
        // TODO: check password
        // TODO: sign description, ...
        LOGGER.debugf("activateOrder/redirect");
        final String signedDescription = description; // TODO
        final Response.ResponseBuilder responseBuilder = Response.status(302).header("signed-text", signedDescription).location(redirectUri);
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
