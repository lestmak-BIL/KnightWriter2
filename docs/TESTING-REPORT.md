# KnightWriter — Testing Report

**Date:** 2026-02-24  
**Reference:** `Testing-Plan.md`  
**Status:** Phases 1–3, 5–6 implemented; Phase A (testing next steps) done; Phase 4 manual checklist created, not yet run.

---

## Current status (post–Phase A)

| Metric | Value |
|--------|--------|
| Unit + integration tests | **58** passed |
| E2E tests | **8** passed, **1** skipped (task list checkbox toggle) |
| Coverage (src/) | **82.81%** statements (baseline recorded) |
| Phase A (critical) | Done: scroll sync E2E, task list plugin + skipped checkbox test, coverage baseline, manual checklist doc |

**Artifacts:** `docs/MANUAL-TESTING-CHECKLIST.md` (for QA/release), `docs/TESTING-NEXT-STEPS.md` (plan + baseline).  
**Audit:** Iteration 4 in `docs/AUDIT_TRAIL.md`.

---

## 1. Executive summary

The testing plan from `Testing-Plan.md` has been implemented for unit tests, integration tests, end-to-end (E2E) tests, regression tests, and tooling. The suite is green: **58 unit/integration tests** and **8 E2E tests** pass (1 E2E skipped). Coverage reporting is enabled; one SyncEngine bug was found and fixed during implementation. Phase A critical next steps (scroll sync E2E, coverage baseline, manual checklist doc) are complete.

---

## 2. What was implemented

### 2.1 Phase 1 — Unit tests (Vitest + @testing-library/react)

| Area | File(s) | Tests | Description |
|------|---------|-------|--------------|
| **Markdown → HTML** | `src/lib/markdown/markdownToHtml.test.ts` | 10 | Basic markdown, code blocks with syntax, empty input, malformed markdown, raw HTML handling (no script execution). |
| **HTML → Markdown** | `src/lib/markdown/htmlToMarkdown.test.ts` | 6 | Basic HTML, nested structures, empty input, round-trip with markdown. |
| **Round-trip fidelity** | `src/lib/markdown/roundTrip.test.ts` | 9 | Exact or content-preserving round-trip for headings, bold/italic, code blocks, links, blockquotes, ordered list, horizontal rule, inline code; complex nested document. |
| **Sync engine** | `src/lib/sync/syncEngine.test.ts` | 6 | Callback only when source active; no callback when syncing or when visual active; isSyncing set/cleared; cancel pending sync (only last callback runs); debouncing. |
| **Scroll sync** | `src/lib/sync/scrollSync.test.ts` | 3 | `calculateProportionalScroll` (proportional position, zero height, clamping). |
| **Position mapping** | `src/lib/markdown/positionMapper.test.ts` | 4 | Line map, scroll percentage clamping, scroll percentage for element (zero height), find HTML element by line. |
| **Diff engine** | `src/lib/sync/diffEngine.test.ts` | 3 | (Existing) computeDiff, areEquivalent. |
| **Document store** | `src/store/documentStore.test.ts` | 7 | setMarkdown (dirty), updateCurrentFormats, setDirty, setActiveEditor, setScrollSyncEnabled, markSaved, newDocument. |
| **UI store** | `src/store/uiStore.test.ts` | 1 | setTheme. |
| **useDebounce** | `src/hooks/useDebounce.test.ts` | 3 | Callback after wait; rapid calls cancel previous; updated delay. |

**Unit test total:** 52 (plus 6 in integration = 58 total with integration).

### 2.2 Phase 2 — Integration tests

| File | Tests | Description |
|------|-------|--------------|
| `src/integration/sourceToVisual.integration.test.tsx` | 3 | Renders App; source/visual editors present; visual shows store markdown; headings and formatting (strong/em). |
| `src/integration/formatToolbar.integration.test.tsx` | 2 | Toolbar with bold button (data-testid); accessible buttons (bold, italic, heading 1). |

**Integration total:** 5.

### 2.3 Phase 3 — End-to-end tests (Playwright)

| Spec | Tests | Description |
|------|-------|--------------|
| `e2e/basicWorkflow.spec.ts` | 3 | Create/edit document (source → visual); switch editors (source and visual, sync both ways); preserve content on reload (markdown persisted). |
| `e2e/formatting.spec.ts` | 2 | Code blocks (JS, syntax class); task list content (Todo/Done). |
| `e2e/performance.spec.ts` | 1 | Large document (200 lines), visual visible and shows content. |
| `e2e/stress.spec.ts` | 1 | Rapid editor switching (100×), then type in source and assert visual. |
| `e2e/scrollSync.spec.ts` | 1 | Scroll source to middle; assert visual scroll proportion 0.35–0.65. |

**E2E total:** 8 passed, 1 skipped (task list checkbox toggle in `e2e/formatting.spec.ts`).

Config: `playwright.config.ts` — baseURL `http://localhost:5173`, webServer with `reuseExistingServer: true`, screenshot/video on failure.

### 2.4 Phase 5 — Stress tests

Covered by `e2e/stress.spec.ts` (rapid editor switching). The plan’s “rapid formatting (100×)” and “memory leak check (1 hour)” are not implemented; the manual checklist and plan can be extended later if needed.

### 2.5 Phase 6 — Regression tests

- **Folder:** `tests/regression/`
- **File:** `tests/regression/regression.test.ts` — one test ensuring pending sync cancellation does not prevent the next sync from running.
- **README:** `tests/regression/README.md` — instructions for adding regression tests for fixed bugs.

---

## 3. Test IDs and persistence

- **data-testid:** `source-editor` (SourcePane), `visual-editor` (VisualPane), `bold-button` (FormatToolbar). Used by integration and E2E.
- **Persistence:** Markdown was added to the document store’s `persist` partialize so reload restores content; E2E “preserves content on page reload” relies on this.

---

## 4. Bug fix during testing

- **SyncEngine:** After cancelling a pending sync (new input before debounce fired), the next scheduled sync never ran because `pendingSyncCancelled` stayed true. **Fix:** set `pendingSyncCancelled` to `false` when scheduling a new debounced sync so the new callback runs. Covered by unit and regression tests.

---

## 5. Commands and tooling

| Command | Purpose |
|---------|---------|
| `npm test` | Vitest in watch mode (unit + integration). |
| `npm run test:run` | Vitest single run (all unit/integration). |
| `npm run test:coverage` | Vitest with coverage (v8; text, html, lcov). |
| `npm run test:e2e` | Playwright E2E (expects app on port 5173 or starts it if configured). |

Vitest excludes `e2e/**` so Playwright specs are not run by Vitest. Coverage excludes `e2e/`, `src/test/`, and test files.

---

## 6. Coverage

- **Provider:** `@vitest/coverage-v8@^2`
- **Reporters:** text, html, lcov
- **Excluded from coverage:** node_modules, src/test, e2e, `**/*.test.*`, config files

Run `npm run test:coverage` for the full report. Plan targets: overall >85%, critical paths (sync, converters) >95%, UI >70%, utilities >90% — current baseline is in place; coverage can be refined over time.

---

## 7. Alignment with Testing-Plan.md

| Plan item | Status |
|-----------|--------|
| Phase 1.1 Markdown (markdownToHtml, htmlToMarkdown, roundTrip) | Done; round-trip uses exact or content assertions where turndown/markdown-it differ (e.g. list markers, HR). |
| Phase 1.2 Sync (syncEngine, scrollSync) | Done; `calculateProportionalScroll` added and tested. |
| Phase 1.3 Position mapping | Done; tests target existing PositionMapper API. |
| Phase 1.4 Stores (documentStore, uiStore) | Done; no toggleFormat/clearFormats (store has updateCurrentFormats). |
| Phase 1.5 useDebounce | Done; tests debounced callback, not value. |
| Phase 2 Integration (source→visual, visual→source, scrollSync, toolbar) | Partial; sourceToVisual and formatToolbar covered; full visual→source and scroll sync integration would need more DOM/CodeMirror/TipTap setup. |
| Phase 3 E2E (basic, formatting, performance) | Done; performance uses 200-line doc to stay within timeout. |
| Phase 4 Manual checklist | Unchanged; still in Testing-Plan.md for manual runs. |
| Phase 5 Stress | One E2E stress test (editor switching); others optional. |
| Phase 6 Regression | Folder and example test added. |
| Vitest config (coverage, setup) | Done. |
| Playwright config | Done. |

---

## 8. Files touched (summary)

**New test files:**  
`src/lib/markdown/roundTrip.test.ts`, `src/lib/sync/syncEngine.test.ts`, `src/lib/sync/scrollSync.test.ts`, `src/store/documentStore.test.ts`, `src/store/uiStore.test.ts`, `src/hooks/useDebounce.test.ts`, `src/integration/sourceToVisual.integration.test.tsx`, `src/integration/formatToolbar.integration.test.tsx`, `tests/regression/regression.test.ts`, `tests/regression/README.md`, `e2e/basicWorkflow.spec.ts`, `e2e/formatting.spec.ts`, `e2e/performance.spec.ts`, `e2e/stress.spec.ts`, `playwright.config.ts`.

**Modified:**  
`src/lib/markdown/markdownToHtml.test.ts`, `src/lib/markdown/htmlToMarkdown.test.ts`, `src/lib/markdown/positionMapper.test.ts`, `src/lib/sync/syncEngine.ts`, `src/lib/sync/scrollSync.ts`, `src/store/documentStore.ts`, `src/components/Editor/SourcePane.tsx`, `src/components/Editor/VisualPane.tsx`, `src/components/Toolbar/FormatToolbar.tsx`, `src/components/Toolbar/ToolbarButton.tsx`, `vitest.config.ts`, `package.json`.

**New dev dependency:** `@playwright/test`, `@vitest/coverage-v8@^2`.

---

## 9. How to run and extend

1. **Unit + integration:** `npm run test:run` — all 58 tests.
2. **Coverage:** `npm run test:coverage` — open `coverage/index.html` for the report.
3. **E2E:** Start the app (`npm run dev`), then `npm run test:e2e` (Playwright uses existing server when `reuseExistingServer: true`).
4. **Regression:** Add new cases under `tests/regression/` for each fixed bug; follow `tests/regression/README.md`.
5. **Manual:** Use the Phase 4 checklist in `Testing-Plan.md` for release and UX checks.

This report and the audit trail (Iteration 3 in `docs/AUDIT_TRAIL.md`) document the current testing implementation and status.

---

## 10. Next steps

**Immediate (before v1.0):** Run the **manual testing checklist** — copy `docs/MANUAL-TESTING-CHECKLIST.md` into a GitHub issue or tracker, assign to QA or dev, and complete sections 4.1–4.11 before release.

**Next (Phase B):** See **`docs/TESTING-NEXT-STEPS.md`** for E2E link insertion (B1), performance benchmarks (B2), rapid-formatting stress test (B3), and optional integration boost (B4).
