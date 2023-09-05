/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
import { LitElement } from 'lit';
/**
 * An example element.
 *
 * @fires count-changed - Indicates when the count changes
 * @slot - This element has a slot
 * @csspart button - The button
 */
export declare class KeycloakSignature extends LitElement {
    static styles: import("lit").CSSResult;
    keycloakSignEndpoint: string;
    render(): import("lit-html").TemplateResult<1>;
    firstUpdated(): void;
    handleAcceptButtonClick(): Promise<void>;
    handleRejectButtonClick(): void;
    /**
     * Formats a greeting
     * @param name The name to say "Hello" to
     */
    sayHello(name: string): string;
}
declare global {
    interface HTMLElementTagNameMap {
        'keycloak-signature': KeycloakSignature;
    }
}
//# sourceMappingURL=keycloak-signature.d.ts.map