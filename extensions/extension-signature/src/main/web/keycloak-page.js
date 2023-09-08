/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { css, html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
/**
 *
 * @slot - This element has a slot
 */
let KeycloakPage = class KeycloakPage extends LitElement {
    render() {
        return html `
      <h1>Custom Element loaded</h1>
      <slot @keycloak-signed-payload="${this.handleAcceptedEvent}"></slot>
    `;
    }
    firstUpdated() {
        // const keycloakSignatureElement = document.querySelector('keycloak-signature');
        //
        // keycloakSignatureElement!.addEventListener('accepted', (event) => {
        //   console.log('Accepted Custom Event received:  ' + event.detail.signedPayload);
        // });
    }
    handleAcceptedEvent(event) {
        console.log('Accepted custom event received with signed payload:', event.detail.signedPayload);
    }
};
KeycloakPage.styles = css `
    :host {
      display: block;
      border: solid 1px gray;
      padding: 16px;
      max-width: 800px;
    }
  `;
KeycloakPage = __decorate([
    customElement('keycloak-page')
], KeycloakPage);
export { KeycloakPage };
//# sourceMappingURL=keycloak-page.js.map