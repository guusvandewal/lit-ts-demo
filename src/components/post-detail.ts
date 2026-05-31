// src/components/post-detail.ts
// Toont een geselecteerde post + lazy-loaded comments

import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { Post, User, Comment, AsyncState } from '../types.js';
import { api } from '../api.js';
import './loading-spinner.js';
import './error-message.js';

@customElement('post-detail')
export class PostDetail extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .panel {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      overflow: hidden;
    }

    header {
      padding: 1.5rem;
      border-bottom: 1px solid #f3f4f6;
    }

    .close-btn {
      float: right;
      background: none;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      padding: 0.3rem 0.7rem;
      cursor: pointer;
      font-size: 0.8rem;
      color: #6b7280;
      transition: background 0.15s;
    }

    .close-btn:hover {
      background: #f9fafb;
    }

    .author {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.75rem;
    }

    .avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 700;
      font-size: 0.8rem;
      flex-shrink: 0;
    }

    .author-info {
      display: flex;
      flex-direction: column;
      gap: 0.1rem;
    }

    .author-name {
      font-weight: 600;
      font-size: 0.9rem;
      color: #111827;
    }

    .author-email {
      font-size: 0.78rem;
      color: #9ca3af;
    }

    h2 {
      margin: 0 0 0.75rem;
      font-size: 1.1rem;
      font-weight: 700;
      color: #111827;
      text-transform: capitalize;
      line-height: 1.4;
    }

    .body {
      padding: 1.25rem 1.5rem;
      font-size: 0.9rem;
      color: #374151;
      line-height: 1.7;
      border-bottom: 1px solid #f3f4f6;
    }

    .comments-section {
      padding: 1.25rem 1.5rem;
    }

    .comments-header {
      font-size: 0.85rem;
      font-weight: 600;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 1rem;
    }

    .comment {
      padding: 0.85rem 0;
      border-bottom: 1px solid #f3f4f6;
    }

    .comment:last-child {
      border-bottom: none;
    }

    .comment-author {
      font-size: 0.8rem;
      font-weight: 600;
      color: #4f46e5;
      margin-bottom: 0.3rem;
    }

    .comment-body {
      font-size: 0.85rem;
      color: #6b7280;
      line-height: 1.5;
    }
  `;

  @property({ type: Object })
  post!: Post;

  @property({ type: Object })
  user?: User;

  // Interne state voor comments (lazy loaded)
  @state()
  private _comments: AsyncState<Comment[]> = { status: 'idle' };

  // Lifecycle: laad comments zodra de component in de DOM verschijnt
  connectedCallback() {
    super.connectedCallback();
    this._loadComments();
  }

  // willUpdate: laad comments opnieuw als de post verandert
  willUpdate(changedProperties: Map<string, unknown>) {
    if (changedProperties.has('post')) {
      this._loadComments();
    }
  }

  private async _loadComments() {
    if (!this.post) return;

    this._comments = { status: 'loading' };

    try {
      const data = await api.posts.comments(this.post.id);
      this._comments = { status: 'success', data };
    } catch (err) {
      this._comments = {
        status: 'error',
        message: err instanceof Error ? err.message : 'Onbekende fout',
      };
    }
  }

  private _onClose() {
    this.dispatchEvent(new CustomEvent('close', { bubbles: true, composed: true }));
  }

  private _renderComments() {
    switch (this._comments.status) {
      case 'idle':
      case 'loading':
        return html`<loading-spinner label="Comments laden..."></loading-spinner>`;
      case 'error':
        return html`
          <error-message
            message=${this._comments.message}
            retryable
            @retry=${this._loadComments}
          ></error-message>
        `;
      case 'success':
        return html`
          ${this._comments.data.map(
            (c) => html`
              <div class="comment">
                <div class="comment-author">${c.email}</div>
                <div class="comment-body">${c.body}</div>
              </div>
            `
          )}
        `;
    }
  }

  private _getInitials(name: string): string {
    return name
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase();
  }

  render() {
    const userName = this.user?.name ?? `Gebruiker ${this.post.userId}`;
    const userEmail = this.user?.email ?? '';

    return html`
      <div class="panel">
        <header>
          <button class="close-btn" @click=${this._onClose} aria-label="Sluiten">
            ✕ Sluiten
          </button>
          <div class="author">
            <div class="avatar">${this._getInitials(userName)}</div>
            <div class="author-info">
              <span class="author-name">${userName}</span>
              ${userEmail ? html`<span class="author-email">${userEmail}</span>` : ''}
            </div>
          </div>
          <h2>${this.post.title}</h2>
        </header>

        <div class="body">${this.post.body}</div>

        <div class="comments-section">
          <div class="comments-header">
            Reacties
            ${this._comments.status === 'success'
              ? `(${this._comments.data.length})`
              : ''}
          </div>
          ${this._renderComments()}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'post-detail': PostDetail;
  }
}
