# lit-ts-demo
v.1.0.0
Een praktisch voorbeeld van Lit 3 + TypeScript met Vite. Demonstreert:

- **Async API fetching** met typed state (`AsyncState<T>`)
- **Component compositie** — kleine, herbruikbare components
- **TypeScript decorators** — `@customElement`, `@property`, `@state`
- **Custom Events** met typed `CustomEvent<T>`
- **Shadow DOM** styling + CSS custom properties
- **Props-down, events-up** communicatiepatroon

## Starten

```bash
npm install
npm run dev
```

Open `http://localhost:5173` in je browser.

## Builden

```bash
npm run build
npm run preview
```

## Projectstructuur

```
src/
├── main.ts                    # Entry point
├── api.ts                     # API service layer (JSONPlaceholder)
├── types.ts                   # TypeScript interfaces
└── components/
    ├── posts-app.ts           # Root component, orkestreert alles
    ├── post-card.ts           # Kaartje voor één post
    ├── post-detail.ts         # Detail panel + comments (lazy loaded)
    ├── user-filter.ts         # Sidebar filtercomponent
    ├── loading-spinner.ts     # Herbruikbare spinner
    └── error-message.ts       # Herbruikbare foutmelding
```

## Concepten per bestand

### `types.ts` — `AsyncState<T>`
Een discriminated union type voor async state:
```ts
type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; message: string };
```
TypeScript dwingt je bij elke `switch` alle cases af te handelen.

### `api.ts` — gescheiden API-laag
De API-laag is puur TypeScript, geen Lit-afhankelijkheden.
Makkelijk te testen of te vervangen.

### `posts-app.ts` — state management
De root component houdt alle state bij en geeft die via properties
door aan children. Children communiceren terug via Custom Events.

### `post-detail.ts` — `willUpdate` voor side effects
```ts
willUpdate(changedProperties: Map<string, unknown>) {
  if (changedProperties.has('post')) {
    this._loadComments(); // herlaad bij post-wijziging
  }
}
```
Vergelijkbaar met `watch` in Vue of `useEffect` met dependency array in React.

### Custom Events — type-veilig
```ts
this.dispatchEvent(
  new CustomEvent<{ post: Post }>('post-select', {
    detail: { post: this.post },
    bubbles: true,
    composed: true, // ← passeert Shadow DOM grens
  })
);
```

## Wat kun je uitbreiden?

- **Context API** (`@lit/context`) voor globale state zonder prop-drilling
- **Routing** met `@vaadin/router` of `universal-router`
- **Unit tests** met `@web/test-runner` + `@open-wc/testing`
- **Storybook** voor component-isolatie (ondersteunt Web Components)
