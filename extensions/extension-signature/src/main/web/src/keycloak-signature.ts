import { CSSResultGroup, html, LitElement, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import styles from './keycloak-signature.scss.js';

enum SignatureEvents {
  failure = 'failure',
  signed = 'signed',
  rejected = 'rejected',
}

/**
 * The Keycloak-signature custom element is structured as follows:
 * 1. Has a title
 * 2. Renders what is provided in the <slot> element
 * 3. Includes elements necessary for authentication (e.g. password input)
 * 4. Provides an accept button
 * 5. Provides a reject button
 *
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
  titleText = 'Keycloak Signature Extension';

  @property({ attribute: 'accept', type: String })
  acceptText = 'Accept';

  @property({ attribute: 'reject', type: String })
  rejectText = 'Reject';

  @property({ attribute: 'max-nr-of-auth-attempts', type: Number })
  maxNrOfAuthAttempts = 3;

  @state()
  private messageToShow = '';

  private attemptIndex = 1;
  private lastSignCallResultedInAuthenticationFailed = false;

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
        <slot><p>Please provide your credentials below</p></slot>
        <form @submit="${this.handleFormSubmit}">
          <label class="password" part="password"
            >Password <br />
            <br />
            <input type="password" id="password" name="password" /><br /><br />
          </label>
          <p class="message-text" part="message-text">${this.messageToShow}</p>
          <button class="accept-button" part="accept-button" type="submit">
            ${this.acceptText}
          </button>
          <button
            class="reject-button"
            part="reject-button"
            @click="${this.handleResetButton}"
            type="reset"
          >
            ${this.rejectText}
          </button>
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
      this.noPasswordEntered(form);
      return;
    }
    if (this.attemptIndex >= this.maxNrOfAuthAttempts) {
      this.maxNrOfAuthAttemptsExceeded(form);
      return;
    }

    await this.makeSignRequest(form, password);
  }

  private async makeSignRequest(
    form: HTMLFormElement,
    password: FormDataEntryValue
  ) {
    try {
      const url = this.signEndpoint;
      const data = {
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
        const bodyJson = await response.json();

        this.lastSignCallResultedInAuthenticationFailed = false;
        this.attemptIndex = this.maxNrOfAuthAttempts;
        this.messageToShow = '';
        this.createAndDispatchAcceptEvent(bodyJson);
      } else if (response.status === 403) {
        console.warn('Authentication failed (403).', this.attemptIndex);
        this.handleWrongPasswordEntered();
      } else {
        console.error('Unexpected failure response received.');
        this.handleUnexpectedFailureReponse(response);
      }
    } catch (error) {
      console.error('Error:', error);
      this.handleErrorDuringRequest(error);
    } finally {
      form.reset();
    }
  }

  private handleResetButton() {
    this.dispatchEvent(new CustomEvent(SignatureEvents.rejected));
  }

  private noPasswordEntered(form: HTMLFormElement) {
    console.error('No password given');
    this.messageToShow = 'Please enter a password';
    form.reset();
    return;
  }

  private maxNrOfAuthAttemptsExceeded(form: HTMLFormElement) {
    this.messageToShow = 'Number of authentication attempts exceeded';
    if (this.lastSignCallResultedInAuthenticationFailed) {
      this.createAndDispatchFailureEvent(
        'Failure during Signing: Authentication did not work. '
      );
    }
    form.reset();
    return;
  }

  private handleWrongPasswordEntered() {
    this.messageToShow = 'Wrong password';
    this.lastSignCallResultedInAuthenticationFailed = true;
    this.attemptIndex++;
  }

  private handleUnexpectedFailureReponse(response: Response) {
    this.messageToShow = 'Something unexpected happened';
    this.lastSignCallResultedInAuthenticationFailed = false;
    this.attemptIndex = this.maxNrOfAuthAttempts;
    this.createAndDispatchFailureEvent(
      'Failure during Signing: Unexpected failure happened. Status response of Keycloak is: ' +
        response.statusText
    );
  }

  private handleErrorDuringRequest(error: unknown) {
    this.messageToShow = 'Something unexpected happened';
    this.lastSignCallResultedInAuthenticationFailed = false;
    this.attemptIndex = this.maxNrOfAuthAttempts;
    this.createAndDispatchFailureEvent(
      'Failure during Signing: Unexpected failure happened: : ' + error
    );
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

  interface ElementEventMap {
    [SignatureEvents.signed]: CustomEvent<{ signedPayload: string }>;
    [SignatureEvents.rejected]: CustomEvent<{ reason: string }>;
    [SignatureEvents.failure]: CustomEvent;
  }
}
