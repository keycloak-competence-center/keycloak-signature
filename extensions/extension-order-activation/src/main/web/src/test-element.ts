/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {css, html, LitElement} from 'lit';
import {customElement} from 'lit/decorators.js';

/**
 * An example element.
 *
 * @fires count-changed - Indicates when the count changes
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement('test-element')
export class TestElement extends LitElement {
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
      <h1>Custom Element loaded</h1>
      <slot @accepted="${this.handleAcceptedEvent}"></slot>
    `;
  }

  override firstUpdated() {
    // const keycloakSignatureElement = document.querySelector('keycloak-signature');
    //
    // keycloakSignatureElement!.addEventListener('accepted', (event) => {
    //   console.log('Accepted Custom Event received:  ' + event.detail.signedPayload);
    // });
  }

  handleAcceptedEvent(event: CustomEvent) {
    console.log('Accepted custom event received with signed payload:', event.detail.signedPayload);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'test-element': TestElement;
  }
}
