import { CSSResultGroup, html, LitElement, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import styles from './keycloak-signature.scss.js';

enum SignatureEvents {
  failure = 'failure',
  signed = 'signed',
  rejected = 'rejected',
}

/**
 * An example element.
 *
 * @fires count-changed - Indicates when the count changes
 * @slot - This element has a slot
 * @csspart button - The button
 * @customElement keycloak-signature
 */
@customElement('keycloak-signature')
export class KeycloakSignature extends LitElement {
  /** @private */
  static override styles: CSSResultGroup = styles;

  @property()
  signEndpoint = '/realms/master/signature/sign';

  @property({ attribute: 'payload', type: String })
  payload: string | undefined;

  @property({ attribute: 'title', type: String })
  titleText = 'Title';

  @property({ attribute: 'accept', type: String })
  acceptText = 'Accept';

  @property({ attribute: 'reject', type: String })
  rejectText = 'Reject';

  @property({ attribute: 'max-nr-of-auth-attempts', type: Number })
  maxNrOfAuthAttempts = 3;

  private attemptIndex = 1;
  private lastSignCallResultedInAuthenticationFailed = false;

  @state()
  private messageToShow = '';

  override render() {
    if (!this.payload) {
      console.warn('No valid payload provided.');
      return nothing;
    }

    return html`
      <div class="wrapper">
        ${this.titleText
          ? html`<h1 class="title" part="title">${this.titleText}</h1>`
          : nothing}
        <slot></slot>
        <form
          @submit="${this.handleFormSubmit}"
          @reset="${this.handleFormReset}"
        >
          <label for="password">Password:</label>
          <input type="password" id="password" name="password" /><br /><br />
          <p style="color:#FF0000">${this.messageToShow}</p>
          <button type="submit">${this.acceptText}</button>
          <button type="reset">${this.rejectText}</button>
        </form>
      </div>
    `;
  }

  private async handleFormSubmit(e: Event) {
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    const data = new FormData(form);
    const password = data.get('password');
    if (!password) {
      console.error('No password given');
      form.reset();
      return;
    }

    if (this.attemptIndex >= this.maxNrOfAuthAttempts) {
      this.messageToShow = 'Number of authentication attempts exceeded';
      if (this.lastSignCallResultedInAuthenticationFailed) {
        this.createAndDispatchFailureEvent(
          'Failure during Signing: Authentication did not work. '
        );
      }
      form.reset();
      return;
    }

    console.log('handleAcceptButtonClick: ');
    try {
      // const url = '/realms/koerber/activate_order/sign?redirect_uri=http%3A%2F%2Fgoogle.com%3Ftest1%3D1%26test2%3D2&description=this_is_an_order'; // Replace with your API endpoint
      const url = this.signEndpoint;
      const data = {
        // Define the data you want to send in the request body
        payload: this.payload,
        credentials: { password },
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
        this.createAndDispatchAcceptEvent(bodyJson);
      } else if (response.status === 403) {
        console.log('403: authentication failed', this.attemptIndex);
        this.messageToShow = 'Wrong password';
        this.lastSignCallResultedInAuthenticationFailed = true;
        this.attemptIndex++;
      } else {
        console.error('POST request failed');
        this.messageToShow = 'Something unexpected happened';
        this.lastSignCallResultedInAuthenticationFailed = false;
        this.attemptIndex = this.maxNrOfAuthAttempts;
        this.createAndDispatchFailureEvent(
          'Failure during Signing: Unexpected failure happened. Status response of Keycloak is: ' +
            response.statusText
        );
      }
    } catch (error) {
      console.error('Error:', error);
      this.messageToShow = 'Something unexpected happened';
      this.lastSignCallResultedInAuthenticationFailed = false;
      this.attemptIndex = this.maxNrOfAuthAttempts;
      this.createAndDispatchFailureEvent(
        'Failure during Signing: Unexpected failure happened: : ' + error
      );
    } finally {
      form.reset();
    }
  }

  private handleFormReset() {
    this.dispatchEvent(new CustomEvent(SignatureEvents.rejected));
  }

  private createAndDispatchAcceptEvent({
    signedPayload,
  }: Record<string, string>) {
    this.dispatchEvent(
      new CustomEvent(SignatureEvents.signed, {
        detail: {
          signedPayload,
        },
      })
    );
  }

  private createAndDispatchFailureEvent(reason: String) {
    this.dispatchEvent(
      new CustomEvent(SignatureEvents.failure, {
        detail: {
          reason: reason,
        },
      })
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'keycloak-signature': KeycloakSignature;
  }
}
