package com.inventage.keycloak.reenterpasswordauthenticator.infrastructure.resource;

import org.keycloak.models.KeycloakSession;
import org.keycloak.services.resource.RealmResourceProvider;

public class ReenterPasswordResourceProvider implements RealmResourceProvider {

    final KeycloakSession session;

    public ReenterPasswordResourceProvider(KeycloakSession session) {
        this.session = session;
    }

    @Override
    public Object getResource() {
        return new ReenterPasswordResource(session);
    }

    @Override
    public void close() {

    }
}
