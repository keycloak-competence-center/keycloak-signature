import { CSSResultGroup, html, LitElement, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import styles from './keycloak-signature.scss.js';

enum SignatureEvents {
  failed = 'failed',
  signed = 'signed',
  rejected = 'rejected',
}

enum FailureReasons {
  authenticationFailed = 'authentication-failed',
  authenticationForbidden = 'authentication-forbidden',
  passwordEmpty = 'password-empty',
  unexpectedError = 'unexpected-error',
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

  private attemptIndex = 1;

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
    if (this.attemptIndex >= this.maxNrOfAuthAttempts) {
      this.maxNrOfAuthAttemptsExceeded(form);
      return;
    }
    if (!password) {
      this.noPasswordEntered(form);
      return;
    }

    try {
      const response = await this.makeSignRequest(password);

      if (response.ok) {
        const bodyJson = await response.json();

        this.attemptIndex = this.maxNrOfAuthAttempts;
        this.createAndDispatchAcceptEvent(bodyJson);
      } else if (response.status === 403) {
        console.warn('Authentication failed (403).', this.attemptIndex);
        this.handleWrongPasswordEntered();
      } else {
        console.error('Unexpected failure response received. ');
        this.handleUnexpectedFailureResponse();
      }
    } catch (error) {
      console.error('Error:', error);
      this.handleErrorDuringRequest();
    } finally {
      form.reset();
    }
  }

  private makeSignRequest(password: FormDataEntryValue) {
    const url = this.signEndpoint;
    const data = {
      payload: this.payload,
      credentials: { password },
    };

    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  }

  private handleResetButton() {
    this.dispatchEvent(new CustomEvent(SignatureEvents.rejected));
  }

  private noPasswordEntered(form: HTMLFormElement) {
    console.error('No password given');
    this.createAndDispatchFailureEvent(FailureReasons.passwordEmpty);
    form.reset();
    return;
  }

  private maxNrOfAuthAttemptsExceeded(form: HTMLFormElement) {
    this.createAndDispatchFailureEvent(FailureReasons.authenticationForbidden);
    form.reset();
    return;
  }

  private handleWrongPasswordEntered() {
    this.attemptIndex++;
    this.createAndDispatchFailureEvent(FailureReasons.authenticationFailed);
  }

  private handleUnexpectedFailureResponse() {
    this.attemptIndex = this.maxNrOfAuthAttempts;
    this.createAndDispatchFailureEvent(FailureReasons.unexpectedError);
  }

  private handleErrorDuringRequest() {
    this.attemptIndex = this.maxNrOfAuthAttempts;
    this.createAndDispatchFailureEvent(FailureReasons.unexpectedError);
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
      new CustomEvent(SignatureEvents.failed, {
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
