package com.inventage.keycloak.reenterpasswordauthenticator.infrastructure.record;

import java.util.Map;

public record SignRequest(String payload, Map<String, String> credentials) {
}
