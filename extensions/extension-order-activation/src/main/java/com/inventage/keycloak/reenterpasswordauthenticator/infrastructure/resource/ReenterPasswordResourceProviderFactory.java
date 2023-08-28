package com.inventage.keycloak.reenterpasswordauthenticator.infrastructure.resource;

import com.google.auto.service.AutoService;
import org.keycloak.Config;
import org.keycloak.models.KeycloakSession;
import org.keycloak.models.KeycloakSessionFactory;
import org.keycloak.services.resource.RealmResourceProvider;
import org.keycloak.services.resource.RealmResourceProviderFactory;

@AutoService(org.keycloak.services.resource.RealmResourceProviderFactory.class)
public class ReenterPasswordResourceProviderFactory implements RealmResourceProviderFactory {

    private static final String ID = "activate_order";

    @Override
    public String getId() {
        return ID;
    }

    @Override
    public RealmResourceProvider create(KeycloakSession keycloakSession) {
        return new ReenterPasswordResourceProvider();
    }

    @Override
    public void init(Config.Scope scope) {

    }

    @Override
    public void postInit(KeycloakSessionFactory keycloakSessionFactory) {

    }

    @Override
    public void close() {

    }
}
