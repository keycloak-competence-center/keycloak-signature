package com.inventage.keycloak.signature.infrastructure.resource;

import org.keycloak.models.KeycloakSession;
import org.keycloak.services.resource.RealmResourceProvider;

public class SignatureResourceProvider implements RealmResourceProvider {

    final KeycloakSession session;

    public SignatureResourceProvider(KeycloakSession session) {
        this.session = session;
    }

    @Override
    public Object getResource() {
        return new SignatureResource(session);
    }

    @Override
    public void close() {

    }
}
