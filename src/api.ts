// src/api.ts
// Centrale API-laag — volledig los van Lit/DOM

import type { Post, User, Comment } from './types.js';

const BASE_URL = 'https://jsonplaceholder.typicode.com';

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`);

  if (!response.ok) {
    throw new Error(`API fout ${response.status}: ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export const api = {
  posts: {
    list: (params?: { userId?: number }) => {
      const query = params?.userId ? `?userId=${params.userId}` : '';
      return fetchJson<Post[]>(`/posts${query}`);
    },
    get: (id: number) => fetchJson<Post>(`/posts/${id}`),
    comments: (postId: number) => fetchJson<Comment[]>(`/posts/${postId}/comments`),
  },

  users: {
    list: () => fetchJson<User[]>('/users'),
    get: (id: number) => fetchJson<User>(`/users/${id}`),
  },
};
