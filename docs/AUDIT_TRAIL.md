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
