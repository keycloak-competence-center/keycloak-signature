/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
import { LitElement } from 'lit';
/**
 *
 * @slot - This element has a slot
 */
export declare class KeycloakPage extends LitElement {
    static styles: import("lit").CSSResult;
    render(): import("lit-html").TemplateResult<1>;
    firstUpdated(): void;
    private handleAcceptedEvent;
    private handleRejectedEvent;
    private handleFailureEvent;
}
declare global {
    interface HTMLElementTagNameMap {
        'keycloak-page': KeycloakPage;
    }
}
//# sourceMappingURL=keycloak-page.d.ts.map