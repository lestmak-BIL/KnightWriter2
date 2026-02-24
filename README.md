# KnightWriter

Professional bidirectional markdown editor with synchronized source (CodeMirror 6) and visual (TipTap) panes.

## Setup

```bash
npm install
npm run dev
```

## Scripts

- `npm run dev` — Start dev server
- `npm run build` — Production build
- `npm run preview` — Preview production build
- `npm run lint` — Run ESLint
- `npm test` — Run unit tests (Vitest, watch)
- `npm run test:run` — Run unit/integration tests once
- `npm run test:coverage` — Run tests with coverage report
- `npm run test:e2e` — Run Playwright E2E tests (dev server must be running or will start)

## Known limitations (v1.0)

- **Save / Open / Save As** are not implemented. Content is persisted in browser storage only; reload preserves content. Cmd/Ctrl+S is disabled (no browser save dialog).
- **v1.0 testing:** Core functionality is validated by a critical-path smoke test. Full manual checklist (accessibility, cross-browser, performance) is deferred to v1.0.1 — see GitHub issue `[v1.0.1] Full manual testing checklist`.

## Phase 1 manual checklist

- Type in source pane → visual pane updates (after debounce)
- Type in visual pane → source pane updates (after debounce)
- Format toolbar works in both panes
- Toolbar buttons show active state in visual pane
- No sync loops or console errors
- Scroll sync: scroll one pane → the other follows (when “Scroll sync” is on)
- Toggle “Scroll sync” off → panes scroll independently
- Large paste (e.g. 1000 lines) behaves acceptably

## Architecture

- **Single source of truth**: Markdown string in Zustand store
- **Sync engine**: Debounced (300ms source, 500ms visual), checks `activeEditor` and `isSyncing` to avoid loops
- **Scroll sync**: Proportional scroll between panes, throttled ~60fps, optional toggle

## Tech stack

- React 18, TypeScript, Vite
- Zustand (state)
- CodeMirror 6 (source pane), TipTap (visual pane)
- markdown-it, turndown (MD ↔ HTML)
- Tailwind CSS, Lucide icons, react-split
