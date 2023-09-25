import { CSSResultGroup, html, LitElement, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import styles from './keycloak-signature.scss.js';

enum SignatureEvents {
  failed = 'failed',
  signed = 'signed',
  rejected = 'rejected',
}

enum FailureReasons {
  credentialsWrong = 'credentials-wrong',
  maxNrOfAuthAttemptsExceeded = 'max-nr-of-auth-attempts-exceeded',
  credentialsEmpty = 'credentials-empty',
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
 * @attr payload - The payload which is going to be signed by Keycloak
 * @attr sign-endpoint - The API endpoint used for signing
 * @attr title - Text of the title displayed on the top of the component
 * @attr accept - Text of the accept button
 * @attr reject - Text of the reject button
 * @attr max-nr-of-auth-attempts - Maximal number of authentication attempts
 *
 * @fires signed - Dispatched when the given payload has successfully been signed.
 * @fires failed - Dispatched when signing the payload has failed.
 * @fires rejected - Dispatched when the reject button is pressed.
 *
 * @slot - Default content placed inside the main body of the component
 *
 * @csspart title - Representing the title
 * @csspart password - Representing the password
 * @csspart message-text - Representing the text of the message
 * @csspart accept-button - Representing the accept button
 * @csspart reject-button - Representing the reject button
 *
 * @cssprop --keycloak-signature-title-font-size - Controls the font size of the title
 * @cssprop --keycloak-signature-title-font-weight - Controls the font weight of the title
 * @cssprop ----keycloak-signature-title-color - Controls the font weight of the title
 *
 * @cssprop --keycloak-signature-password-font-size - Controls the font size of the password size
 * @cssprop --keycloak-signature-password-font-weight - Controls the font weight of the password
 * @cssprop --keycloak-signature-password-color - Controls the color of the password
 *
 * @cssprop --keycloak-signature-accept-button-font-size - Controls the font size of the accept button
 * @cssprop --keycloak-signature-accept-button-font-weight - Controls the font weight of the accept button
 * @cssprop --keycloak-signature-accept-button-color - Controls the color of the accept button
 * @cssprop --keycloak-signature-accept-button-background-color - Controls the background color of the accept button
 * @cssprop --keycloak-signature-accept-button-border - Controls the border of the accept button
 * @cssprop --keycloak-signature-accept-button-padding - Controls the padding of the accept button
 * @cssprop --keycloak-signature-accept-button-text-align - Controls the text alignment of the accept button
 * @cssprop --keycloak-signature-accept-button-text-decoration - Controls the decoration of the accept button
 * @cssprop --keycloak-signature-accept-button-display - Controls the display of the accept button
 *
 * @cssprop --keycloak-signature-reject-button-font-size - Controls the font size of the reject button
 * @cssprop --keycloak-signature-reject-button-font-weight - Controls the font weight of the reject button
 * @cssprop --keycloak-signature-reject-button-color - Controls the color of the reject button
 * @cssprop --keycloak-signature-reject-button-background-color - Controls the background color of the reject button
 * @cssprop --keycloak-signature-reject-button-border - Controls the border of the reject button
 * @cssprop --keycloak-signature-reject-button-padding - Controls the padding of the reject button
 * @cssprop --keycloak-signature-reject-button-text-align - Controls the text alignment of the reject button
 * @cssprop --keycloak-signature-reject-button-text-decoration - Controls the decoration of the reject button
 * @cssprop --keycloak-signature-reject-button-display - Controls the display of the reject button
 *
 * @cssprop --keycloak-signature-message-text-color - Controls the color of the text of the message
 * @cssprop --keycloak-signature-message-font-size - Controls the font size of the text of the message
 *
 * @customElement keycloak-signature
 */
@customElement('keycloak-signature')
export class KeycloakSignature extends LitElement {
  /** @private */
  static override styles: CSSResultGroup = styles;

  @property({ attribute: 'sign-endpoint', type: String })
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

  private attemptIndex = 0;

  private terminatingEventSent: boolean = false;

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
            @click="${this.handleRejectButton}"
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

    if (this.terminatingEventSent) {
      return;
    }

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
        this.handleUnexpectedError();
      }
    } catch (error) {
      console.error('Error:', error);
      this.handleUnexpectedError();
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

  private handleRejectButton() {
    if (this.terminatingEventSent) {
      return;
    }
    this.terminatingEventSent = true;
    this.dispatchEvent(new CustomEvent(SignatureEvents.rejected));
  }

  private noPasswordEntered(form: HTMLFormElement) {
    console.error('No password given');
    this.createAndDispatchFailureEvent(FailureReasons.credentialsEmpty);
    form.reset();
    return;
  }

  private maxNrOfAuthAttemptsExceeded(form: HTMLFormElement) {
    this.terminatingEventSent = true;
    this.createAndDispatchFailureEvent(
      FailureReasons.maxNrOfAuthAttemptsExceeded
    );
    form.reset();
    return;
  }

  private handleWrongPasswordEntered() {
    this.attemptIndex++;
    this.createAndDispatchFailureEvent(FailureReasons.credentialsWrong);
  }

  private handleUnexpectedError() {
    this.terminatingEventSent = true;
    this.createAndDispatchFailureEvent(FailureReasons.unexpectedError);
  }

  private createAndDispatchAcceptEvent({
    signedPayload,
  }: Record<string, string>) {
    this.terminatingEventSent = true;
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
