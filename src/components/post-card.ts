// src/components/post-card.ts

import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { Post, User } from '../types.js';

// Custom event type voor type-veilige events
export type PostSelectEvent = CustomEvent<{ post: Post }>;

@customElement('post-card')
export class PostCard extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    article {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 10px;
      padding: 1.25rem;
      cursor: pointer;
      transition: box-shadow 0.15s, border-color 0.15s, transform 0.1s;
    }

    article:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      border-color: #c7d2fe;
      transform: translateY(-1px);
    }

    :host([selected]) article {
      border-color: #6366f1;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
    }

    .meta {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.6rem;
    }

    .user-badge {
      font-size: 0.75rem;
      font-weight: 600;
      background: #eef2ff;
      color: #4f46e5;
      padding: 0.2rem 0.6rem;
      border-radius: 999px;
    }

    .post-id {
      font-size: 0.75rem;
      color: #9ca3af;
    }

    h3 {
      margin: 0 0 0.5rem;
      font-size: 0.95rem;
      font-weight: 600;
      color: #111827;
      line-height: 1.4;
      /* Kapitaliseer enkel de eerste letter (API geeft lowercase terug) */
      text-transform: capitalize;
    }

    p {
      margin: 0;
      font-size: 0.85rem;
      color: #6b7280;
      line-height: 1.5;
      /* Kap de preview af op 2 regels */
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `;

  @property({ type: Object })
  post!: Post;

  // Optionele user-data om naam te tonen
  @property({ type: Object })
  user?: User;

  @property({ type: Boolean, reflect: true })
  selected = false;

  private _onClick() {
    this.dispatchEvent(
      new CustomEvent<{ post: Post }>('post-select', {
        detail: { post: this.post },
        bubbles: true,
        composed: true,
      })
    );
  }

  render() {
    return html`
      <article
        @click=${this._onClick}
        role="button"
        tabindex="0"
        aria-pressed=${this.selected}
        @keydown=${(e: KeyboardEvent) => e.key === 'Enter' && this._onClick()}
      >
        <div class="meta">
          <span class="user-badge">
            ${this.user?.name ?? `Gebruiker ${this.post.userId}`}
          </span>
          <span class="post-id">#${this.post.id}</span>
        </div>
        <h3>${this.post.title}</h3>
        <p>${this.post.body}</p>
      </article>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'post-card': PostCard;
  }
}
