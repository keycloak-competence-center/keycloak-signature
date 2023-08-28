package com.inventage.keycloak.reenterpasswordauthenticator.infrastructure.resource;

import org.keycloak.services.resource.RealmResourceProvider;

public class ReenterPasswordResourceProvider implements RealmResourceProvider {

    @Override
    public Object getResource() {
        return new ReenterPasswordResource();
    }

    @Override
    public void close() {

    }
}
