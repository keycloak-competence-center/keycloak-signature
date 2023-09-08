/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {css, html, LitElement} from 'lit';
import {customElement, property, query} from 'lit/decorators.js';

/**
 * An example element.
 *
 * @fires count-changed - Indicates when the count changes
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement('keycloak-signature')
export class KeycloakSignature extends LitElement {
  static override styles = css`
    :host {
      display: block;
      border: solid 1px gray;
      padding: 16px;
      max-width: 800px;
    }
  `;

  @property()
  private signEndpoint = '/realms/master/signature-extension/sign';

  @property( {attribute: 'payload', type: String} )
  private payload = "someValue";

  @property( {attribute: 'title', type: String} )
  private titleText = 'Title';

  @property({attribute: 'accept', type: String})
  private acceptText = 'Accept';

  @property({attribute: 'reject', type: String})
  private rejectText = 'Reject';

  @query("#passwordId")
  private passwordInput?: HTMLInputElement

  override render() {
    return html`
      <p>
        <h1>${this.titleText}</h1>
        <slot>This is the body</slot>
        <label for="password">Password:</label>
        <form>        
          <input type="password" id="passwordId" name="password"><br><br>
          <button type="submit" id="acceptButton" @click="${this.handleAcceptButtonClick}">${this.acceptText}</button>
        </form>
        <button id="rejectButton" @click="${this.handleRejectButtonClick}">${this.rejectText}</button>
      </p>
    `;
  }

  override firstUpdated() {
    const rejectButton = this.shadowRoot!.getElementById('rejectButton');

    rejectButton!.addEventListener('click', () => {
      console.log('Reject Button pressed');
    });
  }

  private async handleAcceptButtonClick(event: Event) {
    event.preventDefault();
    console.log("handleAcceptButtonClick: ")
    try {
      // const url = '/realms/koerber/activate_order/sign?redirect_uri=http%3A%2F%2Fgoogle.com%3Ftest1%3D1%26test2%3D2&description=this_is_an_order'; // Replace with your API endpoint
      const url = this.signEndpoint;
      const data = {
        // Define the data you want to send in the request body
        payload: this.payload,
        credentials: {password : this.passwordInput?.value},
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        console.log('POST request successful');
        console.log("headers: ", response.headers)
        const bodyJson = await response.json();
        console.log("JWT: ", bodyJson.signedPayload);

        this.createAndDispatchAcceptEvent(bodyJson)
        console.log("event dispatched: ");
      } else if (response.status === 401) {
        this.createAndDispatchFailureEvent("Failure during Signing: Authentication of user failed.")
      } else {
        console.error('POST request failed');
        this.createAndDispatchFailureEvent("Failure during Signing: Unexpected failure happened. Status response of Keycloak is: " + response.statusText);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  private handleRejectButtonClick() {
    console.log('Reject Button pressed');

    this.createAndDispatchRejectEvent()
  }

  private createAndDispatchAcceptEvent(bodyJson: Record<string, string>) {
    const eventSignedPayloadReceived = new CustomEvent('signed', {
      detail: {
        signedPayload: bodyJson.signedPayload,
      },
      bubbles: false,
      composed: false
    });

    this.dispatchEvent(eventSignedPayloadReceived);
  }

  private createAndDispatchFailureEvent(reason: String) {
    const eventAuthenticationFailed = new CustomEvent('failure', {
      detail: {
        reason: reason
      },
      bubbles: false,
      composed: false
    });

    this.dispatchEvent(eventAuthenticationFailed);
  }

  private createAndDispatchRejectEvent() {
    const eventRejected = new CustomEvent('rejected', {
      detail: {
        message: "Signing Process has been rejected"
      },
      bubbles: false,
      composed: false
    });

    this.dispatchEvent(eventRejected);
  }

}

declare global {
  interface HTMLElementTagNameMap {
    'keycloak-signature': KeycloakSignature;
  }
}
