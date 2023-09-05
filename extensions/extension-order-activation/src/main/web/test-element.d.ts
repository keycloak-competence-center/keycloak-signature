/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
import { LitElement } from 'lit';
/**
 * An example element.
 *
 * @fires count-changed - Indicates when the count changes
 * @slot - This element has a slot
 * @csspart button - The button
 */
export declare class TestElement extends LitElement {
    static styles: import("lit").CSSResult;
    render(): import("lit-html").TemplateResult<1>;
    firstUpdated(): void;
    handleAcceptedEvent(event: CustomEvent): void;
}
declare global {
    interface HTMLElementTagNameMap {
        'test-element': TestElement;
    }
}
//# sourceMappingURL=test-element.d.ts.map