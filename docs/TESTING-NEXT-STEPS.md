# KnightWriter — Testing Next Steps

This document turns the **Testing Report Analysis & Recommendations** into a concrete plan. It is ordered by priority and linked to the original Testing-Plan.md and TESTING-REPORT.md.

---

## Summary of feedback

- **Strengths:** Critical paths covered, bug found (pendingSyncCancelled), good tooling, regression framework, clear docs.
- **Gaps:** Integration (visual→source, scroll sync, toolbar); E2E (task interaction, scroll sync, links, performance); stress (rapid formatting); manual checklist not run; coverage numbers not tracked; regression process could be clearer.

**Verdict:** Solid for v1.0; add critical E2E, run manual checklist, measure coverage, then ship and iterate.

---

## Coverage baseline (recorded 2026-02-24)

Run `npm run test:coverage`. **Source-only** (excluding config, dist, scripts):

| Area | % Stmts | Target | Notes |
|------|---------|--------|--------|
| **src/** | **82.81** | >70% v1.0, >85% later | Meets v1.0 target. |
| src/lib/markdown/* | 93.33 | >90% | Met. |
| src/lib/sync/syncEngine.ts | 71.42 | >95% | Below target; add edge cases if needed. |
| src/components/* | 81% Editor, 52% Toolbar | >70% | Editor met; Toolbar lower (format branches). |
| src/store/* | 81.42 | — | Good. |
| src/hooks/* | 100 | — | Met. |

**Decision:** Ship v1.0 at current baseline; improve syncEngine and Toolbar coverage in follow-up.

---

## Phase A — Critical (before release)

### A1. E2E: Task list interaction  
**Priority:** Critical  
**File:** `e2e/formatting.spec.ts`  
**Status:** Done (partial). Added `markdown-it-task-lists`; task list content test passes. Checkbox toggle E2E skipped (TipTap setContent may not preserve/sync checkbox). See skipped test in formatting.spec.ts.

- Add test: type `- [ ] Task` in source → wait for sync → in visual, find checkbox and check it → assert source contains `- [x] Task`.
- **Caveat:** Current markdown-it setup may not render GFM task lists as `<input type="checkbox">`. If no checkboxes appear, either:
  - Add a markdown-it task-list plugin and keep the test as written, or
  - Keep test as “task list content (Todo/Done) visible” and add a follow-up task to add the plugin + checkbox test.

**Acceptance:** E2E exists that either (a) toggles a task checkbox and asserts source update, or (b) documents the plugin gap and a short follow-up.

---

### A2. E2E: Scroll sync  
**Priority:** Critical  
**File:** `e2e/scrollSync.spec.ts`  
**Status:** Done. New spec: long doc, scroll source to middle, assert visual proportion 0.35–0.65.

- Create long document (e.g. 100 blocks of `# Heading\n\nParagraph`).
- Set content via source (fill or store if possible) and wait for sync.
- Scroll source to middle: `await source.evaluate(el => { el.scrollTop = (el.scrollHeight - el.clientHeight) / 2; })`.
- Wait for scroll sync (e.g. 200–300 ms).
- Read visual scroll: `scrollTop`, `scrollHeight`, `clientHeight`; compute proportion.
- Assert visual scroll proportion is close to 0.5 (e.g. within 10–15%).

**Acceptance:** One E2E test that scrolls source and asserts proportional scroll in visual.

---

### A3. Manual testing checklist (Phase 4)  
**Priority:** Critical  
**Owner:** QA or dev before release  
**Status:** Checklist created: **`docs/MANUAL-TESTING-CHECKLIST.md`** (sections 4.1–4.11 from Testing-Plan). Copy into a GitHub issue or tracker, assign, and run before v1.0.

**Acceptance:** Checklist created; completion/assignee tracked separately.

---

### A4. Coverage baseline  
**Priority:** Critical  
**Status:** Done. Recorded above in “Coverage baseline (recorded 2026-02-24)”. src/ at 82.81%; decision: ship v1.0 at current baseline.

**Acceptance:** Met.

---

## Phase B — Important (next sprint / v1.0.1)

### B1. E2E: Link insertion  
**Priority:** Important  
**File:** `e2e/formatting.spec.ts` or `e2e/toolbar.spec.ts`

- Add `data-testid="link-button"` to FormatToolbar link button (if not present).
- Test: focus visual, type “Click here”, select all (Mod+A), click link button, fill URL (e.g. in prompt or dialog), confirm.
- Assert source contains `[Click here](https://example.com)` (or equivalent).
- **Note:** If link uses `window.prompt`, E2E may need dialog handling (`page.on('dialog', ...)`) or a test-only path; implement accordingly.

**Acceptance:** One E2E test that inserts a link via toolbar and asserts markdown in source.

---

### B2. E2E: Performance benchmarks  
**Priority:** Important  
**File:** `e2e/performance.spec.ts`

- **Sync latency:** Type or fill source with new content; measure time until visual shows that content; assert <500 ms (plan target 300 ms; 500 ms gives CI headroom).
- **Large doc:** Fill source with 10k-line document (e.g. via `source.fill(largeDoc)` so it’s fast); wait for visual to show last line; assert load time <5 s (plan 3 s; 5 s for CI).
- Mark tests as optional or run only in a “performance” job if they are flaky in CI.

**Acceptance:** Two E2E tests (sync latency + 10k lines) with clear thresholds and optional/CI strategy if needed.

---

### B3. Stress: Rapid formatting  
**Priority:** Important  
**File:** `e2e/stress.spec.ts`

- Focus visual, type “Text”, then click bold button 100 times in a loop.
- Type “ more text” and assert source contains “more text” (proves UI still responsive).
- Uses existing `data-testid="bold-button"`.

**Acceptance:** One E2E stress test for rapid bold toggling; no hang or crash.

---

### B4. Integration: Visual → source (optional)  
**Priority:** Important only if E2E is slow or flaky  

- If E2E for visual→source is stable, keep integration light.
- If not: add 1–2 integration tests that drive TipTap (or mock) to set HTML and assert store/source updates, accepting that TipTap/CodeMirror may require mocks or test utilities.

**Acceptance:** Decision documented; if “boost integration,” add at least one test that formats in visual and asserts source content.

---

## Phase C — Nice to have (v1.1+)

### C1. Memory leak test  
**Priority:** Low  

- Plan’s “1-hour session” stress test; only add if users report degradation over long sessions.

### C2. Cross-browser E2E  
**Priority:** Low  

- Playwright projects for Safari, Firefox, Edge; run full or smoke E2E suite.

### C3. Accessibility E2E  
**Priority:** Low  

- Integrate `@axe-core/playwright` and add one or more a11y E2E tests for the main editor view.

---

## Regression test process

- **When:** Every bug fix.
- **Where:** `tests/regression/` (see README there).
- **How:** New file `tests/regression/bug-{issue}.test.ts` (or descriptive name); test reproduces the bug; verify it fails without the fix and passes with it; link to issue/commit in comment.
- README in that folder has been updated with this process and an example.

---

## Suggested order of work

| Order | Item              | Phase | Effort (rough) |
|-------|-------------------|-------|-----------------|
| 1     | Coverage baseline | A4    | 0.5 h           |
| 2     | E2E scroll sync   | A2    | 1 h             |
| 3     | E2E task list     | A1    | 1 h (+ plugin if needed) |
| 4     | Manual checklist  | A3    | 2–4 h (assign & run)     |
| 5     | E2E link          | B1    | 1 h             |
| 6     | Stress formatting | B3    | 0.5 h           |
| 7     | Perf benchmarks   | B2    | 1 h             |
| 8     | Integration (if needed) | B4 | 1–2 h           |

---

## References

- **Testing-Plan.md** — Original plan (Phase 4 manual checklist, coverage targets).
- **docs/TESTING-REPORT.md** — What’s implemented, commands, coverage setup.
- **tests/regression/README.md** — When and how to add regression tests.

Once A1–A4 are done and the manual checklist is signed off, the recommendation is to **ship v1.0** and treat B/C as follow-up work.
