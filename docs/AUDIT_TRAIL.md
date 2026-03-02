# KnightWriter — Build / iteration audit trail

This document records changes for each build or development iteration. Add a new section when you cut a build or finish an iteration.

## How to add an entry

**Option A — Manual:** Copy the template below, paste it at the top of the "Entries" section, fill in date, build id, and changes.

**Option B — Script:** From project root run:
```bash
npm run audit:add -- "Change one" "Change two"
npm run audit:add -- --version 1.0.0 "Release"
```
Version is read from `package.json` unless you pass `--version X.Y.Z`. Each entry is recorded with iteration number, date, and version.

**Build:** Every `npm run build` appends an audit entry with the current `package.json` version and message "Build".

---

## Template (copy for new entries)

```markdown
### Iteration N — YYYY-MM-DD — vX.Y.Z

- 
```

---

## Entries

### Iteration 26 — 2026-03-02 — v1.1.0

- Release 1.1

### Iteration 25 — 2026-02-25 — v1.0.0

- **Export (Phase 2 advanced features):** Export as HTML, Export as PDF, Copy as HTML. New `src/lib/export.ts`: `markdownToStandaloneHtml` (full HTML document with embedded typography CSS), `downloadHtml`, `copyAsHtml` (clipboard with text/html + text/plain), `printAsPdf` (new window + print dialog for “Save as PDF”). Header Export dropdown (Export as HTML, Export as PDF, Copy as HTML); filename/title from current document. Unit tests in `src/lib/export.test.ts` (11 tests). See implementation guide Phase 2 — Export & Share; `docs/MANUAL-TESTING-CHECKLIST.md` and audit updated.

### Iteration 24 — 2026-02-25 — v1.0.0

- **Document tray UI: left sidebar.** Replaced header tabs with a **left sidebar** listing open documents (BBEdit-style). New `DocumentSidebar.tsx`: "Currently Open Documents" header with New (+) and Open (folder) buttons; scrollable list of documents (fileName or "Untitled"), active highlight (blue left border), dirty dot, close (×) when more than one doc. Click a row switches document; keyboard (Enter/Space) supported. App layout: sidebar (fixed width) + main (header with current doc name and toolbar, editor, status bar). Header tabs removed so the sidebar is the single, always-clickable document switcher. Integration tests updated to target header buttons via `within(getByRole('banner'))` and sidebar list via `getByRole('navigation', { name: 'Document list' })`. See `src/components/DocumentSidebar.tsx`, `src/App.tsx`.

### Iteration 23 — 2026-02-25 — v1.0.0

- **Document tray localStorage quota:** Persisting full tray documents (including markdown) caused `QuotaExceededError` when writing `knightwriter-tray`, crashing the app. Fix: (1) **Partialize** now persists only metadata per document (`id`, `fileName`, `isDirty`, `lastSaved`) — no markdown — so payload stays under the ~5MB localStorage limit. (2) **Custom storage** wrapper catches `QuotaExceededError` (and any storage error) in `setItem` and does not rethrow, so the app no longer shows "Something went wrong" when storage is full. (3) **Merge** rehydrates with `DEFAULT_MARKDOWN` when markdown is missing; the existing App hydration effect still restores the active doc’s content from the document store (`knightwriter-storage`). See `src/store/trayStore.ts` (TrayDocumentPersisted, partialize, storage, merge).

### Iteration 21 — 2026-02-25 — v1.0.0

- **Images:** Insert Image toolbar button enabled. Source pane: prompt for image URL (and optional alt from selection), insert `![alt](url)`. Visual pane: TipTap Image extension, prompt for URL and optional alt, `setImage({ src, alt })`. `@tiptap/extension-image` added; allowBase64 for data URLs. htmlToMarkdown: turndown rule for `img` → `![alt](src)`. markdown-it renders images by default. Round-trip test for image added. `data-testid="image-button"` for E2E.

### Iteration 22 — 2026-02-25 — v1.0.0

- **Paste image from clipboard:** In visual pane, `editorProps.handlePaste` detects image in clipboard (`clipboardData.items`), reads file as data URL via FileReader, inserts with `setImage({ src })`. Syncs to source as `![](data:...)`. README and audit (Iteration 21) updated.

### Iteration 20 — 2026-02-25 — v1.0.0

- **Auto-save dirty-flag fix:** Dirty indicator now clears after 5s auto-save. (1) Auto-save timeout reads store at fire-time (`useDocumentStore.getState()`) and calls `saveFile` + `markSaved()` directly so the latest content is saved and dirty is cleared. (2) Store: `updateFromSource` and `setMarkdown` only set `isDirty: true` when content actually changed, so redundant sync/updates no longer flip dirty after save.

### Iteration 19 — 2026-02-25 — v1.0.0

- **Auto-save (next product feature):** When the document has an open file (saved or opened from disk), changes are saved to that file after 5 seconds of inactivity. Implemented in `useFileOperations`: `useEffect` resets a 5s timer on every `markdown`/`isDirty` change; on fire, calls `save()` only when `fileHandleRef.current` is set (no auto-save for untitled docs). README and `docs/MANUAL-TESTING-CHECKLIST.md` updated (4.1 and checklist item).

### Iteration 18 — 2026-02-25 — v1.0.0

- **Phase C testing:** C1 — E2E sustained-use test in `e2e/stress.spec.ts` (many sync/format cycles, no crash, UI responsive); full 1-hour memory test remains manual. C2 — Cross-browser E2E already in place (Playwright chromium/firefox/webkit). C3 — Second a11y E2E: axe on full page (header + main), no critical/serious violations. `docs/TESTING-NEXT-STEPS.md` Phase C status updated; `docs/TESTING-REPORT.md` Phase C summary updated.

### Iteration 17 — 2026-02-25 — v1.0.0

- **v1.0 shipped.** Release complete. Phase 2 file operations (Open, Save, Save As, New, unsaved dialog, Save As filename dialog for Safari/Firefox) included; manual testing and Phase 2 issue closed.

### Iteration 16 — 2026-02-25 — v1.0.0

- **Phase 2 testing complete.** Manual testing checklist Phase 2 — File operations run and signed off. GitHub issue closed.
- Run log in `docs/MANUAL-TESTING-CHECKLIST.md` updated: Phase 2 complete; 4.1 and Phase 2 section results reflect implementation and parked Safari Save As limitation.

### Iteration 15 — 2026-02-25 — v1.0.0

- **Save As in Safari/Firefox:** Browsers without the File System Access API (Safari, Firefox) cannot show a native save-location picker. Added a **Save As filename dialog**: when Save As would trigger a download, the app shows a modal to enter/edit the filename, then triggers the download with that name. New `SaveAsDialog.tsx`; `fileOperations.ts` exports `isSaveAsPickerAvailable()` and `saveWithDownload`; `useFileOperations` shows the dialog when the picker is unavailable (toolbar Save As and unsaved-dialog Save/Save As).
- **Safari tip:** When running in Safari, the Save As dialog shows a note: user can enable *Safari → Settings → General → File download location → Ask for each download* to get Safari’s save-location prompt when downloading.
- **Parked limitation:** Documented in `docs/MANUAL-TESTING-CHECKLIST.md` (Phase 2 — Cross-browser) and `docs/TESTING-PLAN-PHASE2.md`: Safari/Firefox have no web API to choose save location; workaround is the in-app filename dialog + optional Safari “Ask for each download” setting; resolved when shipping as a desktop app (native or Electron/Tauri).
- Unit tests: `isSaveAsPickerAvailable()` in `src/lib/fileOperations.test.ts`.

### Iteration 14 — 2026-02-25 — v1.0.0

- **Unsaved changes dialog (Phase 2 feedback):** Replaced dual `window.confirm` with custom modal offering four options: Cancel, Discard changes, Save, Save As. Used for both New and Open when document is dirty.
- **New when dirty:** New no longer clears the document immediately; shows unsaved dialog first. User must choose Discard (or complete Save/Save As) to create a new document.
- **Save before Open/New with untitled file:** When user chooses Save in the unsaved dialog and the document has no file handle (untitled), we invoke Save As (picker/download) so the user chooses location/name instead of saving to browser default folder.
- New component `UnsavedChangesDialog.tsx`; `useFileOperations` extended with dialog state and pending action (open/new); App wires dialog and uses hook’s `new` for New button.
- E2E and integration tests updated for custom dialog (Cancel/Discard); manual checklist Phase 2 scope note; `docs/FUTURE-IDEAS.md` for document tray / open documents list (BBEdit-style).

### Iteration 13 — 2026-02-24 — v1.0.0

- A11y fixes: aria-label on source editor (EditorView.contentAttributes); One Dark heading contrast override (CSS .ͼ11.ͼ1a + HighlightStyle); a11y test asserts no critical or serious
- Cross-browser E2E (C2): Playwright projects chromium, firefox, webkit

### Iteration 12 — 2026-02-24 — v1.0.0

- Build

### Iteration 11 — 2026-02-24 — v1.0.0

- E2E link insertion (B1): data-testid="link-button", test in formatting.spec.ts (visual → link → source markdown)
- E2E stress: rapid bold toggling 100× (B3) in stress.spec.ts — UI stays responsive
- A3 manual checklist signed off
- E2E performance (B2): sync latency <500ms, 10k-line doc visual in <5s (performance.spec.ts)
- Integration visual→source (B4): visualToSource.integration.test.tsx; TipTap editor test hook for format→store assertion
- Accessibility E2E (C3): @axe-core/playwright, e2e/accessibility.spec.ts — axe on main

### Iteration 10 — 2026-02-24 — v1.0.0

- Build

### Iteration 9 — 2026-02-24 — v1.0.0

- Build

### Iteration 8 — 2026-02-24 — v1.0.0

- Build

### Iteration 7 — 2026-02-24 — v1.0.0

- Build

### Iteration 6 — 2026-02-24 — v1.0.0

- v1.0 ship: README Known limitations section
- Version 1.0.0
- Test scripts in README (test:run, test:coverage, test:e2e)
- Deferred issue template: docs/v1.0.1-FULL-MANUAL-TESTING-ISSUE.md

### Iteration 5 — 2026-02-24 — v0.0.0

- Smoke test fixes: Cmd/Ctrl+B and Cmd/Ctrl+I (bold/italic) in both panes
- Cmd/Ctrl+S preventDefault (Save not implemented)
- New document clears preview pane when markdown is empty
- Shortcuts use document capture phase so they work in visual editor

### Iteration 4 — 2026-02-24 — v0.0.0

- Testing next steps: Phase A critical items
- E2E scroll sync (e2e/scrollSync.spec.ts)
- markdown-it-task-lists for GFM task lists; task list checkbox E2E skipped (TipTap gap)
- Coverage baseline recorded (src 82.81%); manual checklist doc (docs/MANUAL-TESTING-CHECKLIST.md)
- TESTING-NEXT-STEPS Phase A marked done

### Iteration 3 — 2026-02-24 — v0.0.0

- Testing: implemented Testing-Plan.md (Phase 1–3, 5–6)
- Unit tests: markdown (round-trip), syncEngine, scrollSync, positionMapper, documentStore, uiStore, useDebounce
- Integration tests: sourceToVisual, formatToolbar
- E2E: Playwright (basicWorkflow, formatting, performance, stress)
- Regression tests folder; Vitest coverage; data-testid on editors/toolbar
- SyncEngine fix: pending sync cancellation no longer blocks next sync
- Store: markdown added to persist for reload; scripts test:run, test:coverage, test:e2e

### Iteration 2 — 2026-02-24 — v0.0.0

- Build

### Iteration 1 — 2025-02-24 — v0.0.0

- Added build/iteration audit trail: `docs/AUDIT_TRAIL.md` and `scripts/audit-add.js`.
- Added npm script `audit:add` to append entries from the command line.
- Version on each entry; audit wired into `npm run build`.
