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
import { customElement, property, query } from 'lit/decorators.js';
/**
 * An example element.
 *
 * @fires count-changed - Indicates when the count changes
 * @slot - This element has a slot
 * @csspart button - The button
 */
let KeycloakSignature = class KeycloakSignature extends LitElement {
    constructor() {
        super(...arguments);
        this.signEndpoint = '/realms/master/signature-extension/sign';
        this.payload = "someValue";
        this.titleText = 'Title';
        this.acceptText = 'Accept';
        this.rejectText = 'Reject';
    }
    render() {
        return html `
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
    firstUpdated() {
        const rejectButton = this.shadowRoot.getElementById('rejectButton');
        rejectButton.addEventListener('click', () => {
            console.log('Reject Button pressed');
        });
    }
    async handleAcceptButtonClick(event) {
        var _a;
        event.preventDefault();
        console.log("handleAcceptButtonClick: ");
        try {
            // const url = '/realms/koerber/activate_order/sign?redirect_uri=http%3A%2F%2Fgoogle.com%3Ftest1%3D1%26test2%3D2&description=this_is_an_order'; // Replace with your API endpoint
            const url = this.signEndpoint;
            const data = {
                // Define the data you want to send in the request body
                payload: this.payload,
                credentials: { password: (_a = this.passwordInput) === null || _a === void 0 ? void 0 : _a.value },
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
                console.log("headers: ", response.headers);
                const bodyJson = await response.json();
                console.log("JWT: ", bodyJson.signedPayload);
                this.createAndDispatchAcceptEvent(bodyJson);
                console.log("event dispatched: ");
            }
            else if (response.status === 401) {
                this.createAndDispatchFailureEvent("Failure during Signing: Authentication of user failed.");
            }
            else {
                console.error('POST request failed');
                this.createAndDispatchFailureEvent("Failure during Signing: Unexpected failure happened. Status response of Keycloak is: " + response.statusText);
            }
        }
        catch (error) {
            console.error('Error:', error);
        }
    }
    handleRejectButtonClick() {
        console.log('Reject Button pressed');
        this.createAndDispatchRejectEvent();
    }
    createAndDispatchAcceptEvent(bodyJson) {
        const eventSignedPayloadReceived = new CustomEvent('signed', {
            detail: {
                signedPayload: bodyJson.signedPayload,
            },
            bubbles: false,
            composed: false
        });
        this.dispatchEvent(eventSignedPayloadReceived);
    }
    createAndDispatchFailureEvent(reason) {
        const eventAuthenticationFailed = new CustomEvent('failure', {
            detail: {
                reason: reason
            },
            bubbles: false,
            composed: false
        });
        this.dispatchEvent(eventAuthenticationFailed);
    }
    createAndDispatchRejectEvent() {
        const eventRejected = new CustomEvent('rejected', {
            detail: {
                message: "Signing Process has been rejected"
            },
            bubbles: false,
            composed: false
        });
        this.dispatchEvent(eventRejected);
    }
};
KeycloakSignature.styles = css `
    :host {
      display: block;
      border: solid 1px gray;
      padding: 16px;
      max-width: 800px;
    }
  `;
__decorate([
    property()
], KeycloakSignature.prototype, "signEndpoint", void 0);
__decorate([
    property({ attribute: 'payload', type: String })
], KeycloakSignature.prototype, "payload", void 0);
__decorate([
    property({ attribute: 'title', type: String })
], KeycloakSignature.prototype, "titleText", void 0);
__decorate([
    property({ attribute: 'accept', type: String })
], KeycloakSignature.prototype, "acceptText", void 0);
__decorate([
    property({ attribute: 'reject', type: String })
], KeycloakSignature.prototype, "rejectText", void 0);
__decorate([
    query("#passwordId")
], KeycloakSignature.prototype, "passwordInput", void 0);
KeycloakSignature = __decorate([
    customElement('keycloak-signature')
], KeycloakSignature);
export { KeycloakSignature };
//# sourceMappingURL=keycloak-signature.js.map