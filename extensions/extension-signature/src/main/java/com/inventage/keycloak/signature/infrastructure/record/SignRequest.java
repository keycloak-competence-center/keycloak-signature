package com.inventage.keycloak.signature.infrastructure.record;

import java.util.Map;

/**
 * POJO used for a sign request.
 *
 * @param payload String value which should later be added to the JWT
 * @param credentials Map of authentication method to its dedicated (login) value
 */
public record SignRequest(String payload, Map<String, String> credentials) {
}
