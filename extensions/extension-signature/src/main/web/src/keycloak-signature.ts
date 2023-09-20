import {css, html, LitElement, nothing} from 'lit';
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

  @property({attribute: 'payload', type: String})
  private payload: string | undefined;

  @property({attribute: 'title', type: String})
  private titleText = 'Title';

  @property({attribute: 'accept', type: String})
  private acceptText = 'Accept';

  @property({attribute: 'reject', type: String})
  private rejectText = 'Reject';

  @property({attribute: 'max-nr-of-auth-attempts', type: Number})
  private maxNrOfAuthAttempts = 3;

  private attemptIndex = 1;
  private lastSignCallResultedInAuthenticationFailed = false

  @property({attribute: false})
  private messageToShow = '';

  @query('#passwordId')
  private passwordInput?: HTMLInputElement;

  override render() {
    if (!this.payload) {
      console.warn('No valid payload provided.');
      return nothing;
    }

    return html`
      <p>
        <h1>${this.titleText}</h1>
        <slot>This is the body</slot>
        <label for="password">Password:</label>
        <form id="form">        
          <input type="password" id="passwordId" name="password"><br><br>
          <p style="color:#FF0000">
            ${this.messageToShow}
          </p>
          <button type="submit" id="acceptButton" @click="${this.handleAcceptButtonClick}">${this.acceptText}</button>
        </form>
        <button id="rejectButton" @click="${this.handleRejectButtonClick}">${this.rejectText}</button>
      </p>
    `;
  }

  private async handleAcceptButtonClick(event: Event) {
    event.preventDefault();

    if (this.attemptIndex >= this.maxNrOfAuthAttempts) {
      this.messageToShow = "Number of authentication attempts exceeded";
      if (this.lastSignCallResultedInAuthenticationFailed) {
        this.createAndDispatchFailureEvent(
          'Failure during Signing: Authentication did not work. '
        );
      }
      return;
    }

    console.log('handleAcceptButtonClick: ');
    try {
      // const url = '/realms/koerber/activate_order/sign?redirect_uri=http%3A%2F%2Fgoogle.com%3Ftest1%3D1%26test2%3D2&description=this_is_an_order'; // Replace with your API endpoint
      const url = this.signEndpoint;
      const data = {
        // Define the data you want to send in the request body
        payload: this.payload,
        credentials: {password: this.passwordInput?.value},
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
        const bodyJson = await response.json();

          this.lastSignCallResultedInAuthenticationFailed = false;
          this.attemptIndex = this.maxNrOfAuthAttempts;
          this.createAndDispatchAcceptEvent(bodyJson)
        } else if (response.status === 403) {
          console.log('403: authentication failed', this.attemptIndex);
          this.messageToShow = "Wrong password";
          this.lastSignCallResultedInAuthenticationFailed = true;
          this.attemptIndex++;
        } else {
          console.error('POST request failed');
          this.messageToShow = "Something unexpected happened";
          this.lastSignCallResultedInAuthenticationFailed = false;
          this.attemptIndex = this.maxNrOfAuthAttempts;
          this.createAndDispatchFailureEvent("Failure during Signing: Unexpected failure happened. Status response of Keycloak is: " + response.statusText);
        }
      } catch (error) {
        console.error('Error:', error);
        this.messageToShow = "Something unexpected happened";
        this.lastSignCallResultedInAuthenticationFailed = false;
        this.attemptIndex = this.maxNrOfAuthAttempts;
        this.createAndDispatchFailureEvent("Failure during Signing: Unexpected failure happened: : " + error);
      }

    this.passwordInput!.value = '';
  }

  private handleRejectButtonClick() {
    console.log('Reject Button pressed');

    this.createAndDispatchRejectEvent();
  }

  private createAndDispatchAcceptEvent(bodyJson: Record<string, string>) {
    const eventSignedPayloadReceived = new CustomEvent('signed', {
      detail: {
        signedPayload: bodyJson.signedPayload,
      },
      bubbles: false,
      composed: false,
    });

    this.dispatchEvent(eventSignedPayloadReceived);
  }

  private createAndDispatchFailureEvent(reason: String) {
    const eventAuthenticationFailed = new CustomEvent('failure', {
      detail: {
        reason: reason,
      },
      bubbles: false,
      composed: false,
    });

    this.dispatchEvent(eventAuthenticationFailed);
  }

  private createAndDispatchRejectEvent() {
    const eventRejected = new CustomEvent('rejected', {
      bubbles: false,
      composed: false,
    });

    this.dispatchEvent(eventRejected);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'keycloak-signature': KeycloakSignature;
  }
}
