import {KeycloakSignature} from './keycloak-signature.js';

import {fixture, assert} from '@open-wc/testing';
import {html} from 'lit/static-html.js';

suite('keycloak-signature', () => {
  test('is defined', () => {
    const el = document.createElement('keycloak-signature');
    assert.instanceOf(el, KeycloakSignature);
  });

  test('renders with default values', async () => {
    const el = await fixture(html`<keycloak-signature></keycloak-signature>`);
    await assert.shadowDom.equal(
      el,
      `
      <h1>Hello, World!</h1>
      <button part='button'>Click Count: 0</button>
      <slot></slot>
    `
    );
  });

  // test('renders with a set name', async () => {
  //   const el = await fixture(
  //     html`<keycloak-signature name="Test"></keycloak-signature>`
  //   );
  //   assert.shadowDom.equal(
  //     el,
  //     `
  //     <h1>Hello, Test!</h1>
  //     <button part="button">Click Count: 0</button>
  //     <slot></slot>
  //   `
  //   );
  // });
  //
  // test('handles a click', async () => {
  //   const el = (await fixture(
  //     html`<keycloak-signature></keycloak-signature>`
  //   )) as KeycloakSignature;
  //   const button = el.shadowRoot!.querySelector('button')!;
  //   button.click();
  //   await el.updateComplete;
  //   assert.shadowDom.equal(
  //     el,
  //     `
  //     <h1>Hello, World!</h1>
  //     <button part="button">Click Count: 1</button>
  //     <slot></slot>
  //   `
  //   );
  // });
  //
  // test('styling applied', async () => {
  //   const el = (await fixture(
  //     html`<keycloak-signature></keycloak-signature>`
  //   )) as KeycloakSignature;
  //   await el.updateComplete;
  //   assert.equal(getComputedStyle(el).paddingTop, '16px');
  // });
});
