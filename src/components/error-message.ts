// src/components/error-message.ts

import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('error-message')
export class ErrorMessage extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .error {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 8px;
      padding: 1rem 1.25rem;
      color: #991b1b;
    }

    .icon {
      font-size: 1.25rem;
      flex-shrink: 0;
      line-height: 1.4;
    }

    .content {
      flex: 1;
    }

    .title {
      font-weight: 600;
      font-size: 0.9rem;
      margin: 0 0 0.25rem;
    }

    .message {
      font-size: 0.875rem;
      margin: 0;
      opacity: 0.85;
    }

    button {
      margin-top: 0.75rem;
      padding: 0.4rem 0.9rem;
      background: #991b1b;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 0.8rem;
      cursor: pointer;
      transition: background 0.15s;
    }

    button:hover {
      background: #7f1d1d;
    }
  `;

  @property({ type: String })
  message = 'Er is iets misgegaan.';

  @property({ type: Boolean })
  retryable = false;

  private _onRetry() {
    // Stuurt een 'retry' event omhoog naar de parent
    this.dispatchEvent(new CustomEvent('retry', { bubbles: true, composed: true }));
  }

  render() {
    return html`
      <div class="error" role="alert">
        <span class="icon">⚠️</span>
        <div class="content">
          <p class="title">Fout opgetreden</p>
          <p class="message">${this.message}</p>
          ${this.retryable
            ? html`<button @click=${this._onRetry}>Opnieuw proberen</button>`
            : ''}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'error-message': ErrorMessage;
  }
}
