/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {css, html, LitElement} from 'lit';
import {customElement} from 'lit/decorators.js';

/**
 *
 * @slot - This element has a slot
 */
@customElement('keycloak-page')
export class KeycloakPage extends LitElement {
  static override styles = css`
    :host {
      display: block;
      border: solid 1px gray;
      padding: 16px;
      max-width: 800px;
    }
  `;

  override render() {
    return html`
      <h1>Keycloak Page</h1>
      <keycloak-signature @signed="${this.handleAcceptedEvent}" @rejected="${this.handleRejectedEvent}" @failure="${this.handleFailureEvent}" title="Overwritten Title" accept="Overwritten Accept" reject="Overwritten Reject">
        <span>Overwritten Body<br/> <br/></span>
      </keycloak-signature>
    `;
  }

  override firstUpdated() {
    // const keycloakSignatureElement = document.querySelector('keycloak-signature');
    //
    // keycloakSignatureElement!.addEventListener('accepted', (event) => {
    //   console.log('Accepted Custom Event received:  ' + event.detail.signedPayload);
    // });
  }

  private handleAcceptedEvent(event: CustomEvent) {
    console.log('Accepted custom event received:', event);
  }

  private handleRejectedEvent(event: CustomEvent) {
    console.log('Rejected custom event received:', event);
  }

  private handleFailureEvent(event: CustomEvent) {
    console.log('Failure custom event received:', event);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'keycloak-page': KeycloakPage;
  }
}
