// src/components/user-filter.ts
// Sidebar met gebruikersfilter — demonstreert @property en event-emitting

import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { User } from '../types.js';

export type UserFilterChangeEvent = CustomEvent<{ userId: number | null }>;

@customElement('user-filter')
export class UserFilter extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    h2 {
      font-size: 0.8rem;
      font-weight: 600;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin: 0 0 0.75rem;
    }

    ul {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    button {
      width: 100%;
      text-align: left;
      padding: 0.55rem 0.75rem;
      border: none;
      border-radius: 7px;
      background: transparent;
      color: #374151;
      font-size: 0.875rem;
      cursor: pointer;
      transition: background 0.1s;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    button:hover {
      background: #f3f4f6;
    }

    button.active {
      background: #eef2ff;
      color: #4f46e5;
      font-weight: 600;
    }

    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #c7d2fe;
      flex-shrink: 0;
    }

    button.active .dot {
      background: #6366f1;
    }
  `;

  @property({ type: Array })
  users: User[] = [];

  @property({ type: Number })
  selectedUserId: number | null = null;

  private _select(userId: number | null) {
    this.dispatchEvent(
      new CustomEvent<{ userId: number | null }>('filter-change', {
        detail: { userId },
        bubbles: true,
        composed: true,
      })
    );
  }

  render() {
    return html`
      <h2>Filteren op auteur</h2>
      <ul role="listbox" aria-label="Gebruikersfilter">
        <li>
          <button
            class=${this.selectedUserId === null ? 'active' : ''}
            @click=${() => this._select(null)}
            role="option"
            aria-selected=${this.selectedUserId === null}
          >
            <span class="dot"></span>
            Alle auteurs
          </button>
        </li>
        ${this.users.map(
          (u) => html`
            <li>
              <button
                class=${this.selectedUserId === u.id ? 'active' : ''}
                @click=${() => this._select(u.id)}
                role="option"
                aria-selected=${this.selectedUserId === u.id}
              >
                <span class="dot"></span>
                ${u.name}
              </button>
            </li>
          `
        )}
      </ul>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'user-filter': UserFilter;
  }
}
