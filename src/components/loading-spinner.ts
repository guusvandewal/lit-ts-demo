// src/components/loading-spinner.ts

import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('loading-spinner')
export class LoadingSpinner extends LitElement {
  static styles = css`
    :host {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: var(--spinner-padding, 2rem);
    }

    .spinner {
      width: var(--spinner-size, 32px);
      height: var(--spinner-size, 32px);
      border: 3px solid #e5e7eb;
      border-top-color: #6366f1;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }

    .label {
      margin-top: 0.75rem;
      font-size: 0.875rem;
      color: #6b7280;
    }

    :host([vertical]) {
      flex-direction: column;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;

  @property({ type: String })
  label = '';

  render() {
    return html`
      <div class="spinner" role="status" aria-label="${this.label || 'Laden...'}"></div>
      ${this.label ? html`<span class="label">${this.label}</span>` : ''}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'loading-spinner': LoadingSpinner;
  }
}
