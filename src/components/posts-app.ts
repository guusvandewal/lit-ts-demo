// src/components/posts-app.ts
// Root component — orkestreert state en child-components

import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import type { Post, User, AsyncState } from '../types.js';
import { api } from '../api.js';
import { debounce } from '../utils.js';
import './loading-spinner.js';
import './error-message.js';
import './post-card.js';
import './post-detail.js';
import './user-filter.js';

@customElement('posts-app')
export class PostsApp extends LitElement {
  static styles = css`
    :host {
      display: block;
      min-height: 100vh;
    }

    /* ── Header ── */
    header {
      background: white;
      border-bottom: 1px solid #e5e7eb;
      padding: 1rem 2rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .logo {
      font-size: 1.1rem;
      font-weight: 700;
      color: #4f46e5;
    }

    .logo span {
      color: #1c1917;
    }

    .search-wrap {
      flex: 1;
      max-width: 400px;
    }

    input[type='search'] {
      width: 100%;
      padding: 0.5rem 0.9rem;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      font-size: 0.875rem;
      color: #1c1917;
      background: #f9fafb;
      transition: border-color 0.15s, background 0.15s;
      box-sizing: border-box;
    }

    input[type='search']:focus {
      outline: none;
      border-color: #a5b4fc;
      background: white;
    }

    .post-count {
      font-size: 0.8rem;
      color: #9ca3af;
      margin-left: auto;
    }

    /* ── Layout ── */
    .layout {
      display: grid;
      grid-template-columns: 220px 1fr;
      grid-template-rows: 1fr;
      min-height: calc(100vh - 57px);
    }

    aside {
      border-right: 1px solid #e5e7eb;
      padding: 1.5rem 1rem;
      background: white;
      position: sticky;
      top: 57px;
      height: calc(100vh - 57px);
      overflow-y: auto;
    }

    main {
      padding: 1.5rem;
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.5rem;
      align-content: start;
    }

    /* Als een post geselecteerd is: split layout */
    .main-split {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
      align-items: start;
    }

    .posts-grid {
      display: grid;
      gap: 0.75rem;
    }

    /* ── States ── */
    .empty {
      text-align: center;
      padding: 3rem 1rem;
      color: #9ca3af;
      font-size: 0.9rem;
    }
  `;

  // Globale async state voor posts en users
  @state() private _posts: AsyncState<Post[]> = { status: 'idle' };
  @state() private _users: AsyncState<User[]> = { status: 'idle' };

  // UI state
  @state() private _selectedPost: Post | null = null;
  @state() private _selectedUserId: number | null = null;
  @state() private _searchQuery = '';

  private _handleSearch = debounce((query: string) => {
    this._searchQuery = query;
  }, 300);

  connectedCallback() {
    super.connectedCallback();
    this._loadData();
  }

  private async _loadData() {
    this._posts = { status: 'loading' };
    this._users = { status: 'loading' };

    // Laad posts en users parallel
    const [postsResult, usersResult] = await Promise.allSettled([
      api.posts.list(),
      api.users.list(),
    ]);

    this._posts =
      postsResult.status === 'fulfilled'
        ? { status: 'success', data: postsResult.value }
        : { status: 'error', message: (postsResult.reason as Error).message };

    this._users =
      usersResult.status === 'fulfilled'
        ? { status: 'success', data: usersResult.value }
        : { status: 'error', message: (usersResult.reason as Error).message };
  }

  // Gefilterde + gezochte posts afleiden uit state
  private get _filteredPosts(): Post[] {
    if (this._posts.status !== 'success') return [];

    return this._posts.data.filter((p) => {
      const matchesUser =
        this._selectedUserId === null || p.userId === this._selectedUserId;
      const q = this._searchQuery.toLowerCase();
      const matchesSearch =
        !q || p.title.toLowerCase().includes(q) || p.body.toLowerCase().includes(q);
      return matchesUser && matchesSearch;
    });
  }

  private _getUserForPost(post: Post): User | undefined {
    if (this._users.status !== 'success') return undefined;
    return this._users.data.find((u) => u.id === post.userId);
  }

  private _onPostSelect(e: CustomEvent<{ post: Post }>) {
    this._selectedPost =
      this._selectedPost?.id === e.detail.post.id ? null : e.detail.post;
  }

  private _onFilterChange(e: CustomEvent<{ userId: number | null }>) {
    this._selectedUserId = e.detail.userId;
    this._selectedPost = null; // reset detail panel bij filter-wijziging
  }

  private _renderContent() {
    switch (this._posts.status) {
      case 'idle':
      case 'loading':
        return html`<loading-spinner label="Posts laden..." vertical></loading-spinner>`;
      case 'error':
        return html`
          <error-message
            message=${this._posts.message}
            retryable
            @retry=${this._loadData}
          ></error-message>
        `;
      case 'success': {
        const posts = this._filteredPosts;
        if (posts.length === 0) {
          return html`<div class="empty">Geen posts gevonden.</div>`;
        }
        return html`
          <div class=${this._selectedPost ? 'main-split' : ''}>
            <div class="posts-grid">
              ${posts.map(
                (post) => html`
                  <post-card
                    .post=${post}
                    .user=${this._getUserForPost(post)}
                    ?selected=${this._selectedPost?.id === post.id}
                    @post-select=${this._onPostSelect}
                  ></post-card>
                `
              )}
            </div>

            ${this._selectedPost
              ? html`
                  <post-detail
                    .post=${this._selectedPost}
                    .user=${this._getUserForPost(this._selectedPost)}
                    @close=${() => (this._selectedPost = null)}
                  ></post-detail>
                `
              : ''}
          </div>
        `;
      }
    }
  }

  render() {
    const users = this._users.status === 'success' ? this._users.data : [];
    const count = this._filteredPosts.length;

    return html`
      <header>
        <div class="logo">Lit<span>Posts</span></div>
        <div class="search-wrap">
          <input
            type="search"
            placeholder="Zoek in posts..."
            .value=${this._searchQuery}
            @input=${(e: InputEvent) =>
              this._handleSearch((e.target as HTMLInputElement).value)}
            aria-label="Zoeken"
          />
        </div>
        ${this._posts.status === 'success'
          ? html`<span class="post-count">${count} post${count !== 1 ? 's' : ''}</span>`
          : ''}
      </header>

      <div class="layout">
        <aside>
          <user-filter
            .users=${users}
            .selectedUserId=${this._selectedUserId}
            @filter-change=${this._onFilterChange}
          ></user-filter>
        </aside>

        <main>${this._renderContent()}</main>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'posts-app': PostsApp;
  }
}
