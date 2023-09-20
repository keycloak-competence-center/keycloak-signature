package com.inventage.keycloak.signature.infrastructure.record;

import java.util.Map;

public record SignRequest(String payload, Map<String, String> credentials) {
}
