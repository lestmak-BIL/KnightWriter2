# KnightWriter v1.0 — Critical Path Smoke Test

**Estimate:** 30–60 min  
**Purpose:** Quick validation of core functionality before v1.0 ship.

---

## Checklist

### 1. Basic editing — source → visual
- [ ] Type in source pane (e.g. `# Hello` and a paragraph)
- [ ] Visual pane updates within ~300 ms with heading and paragraph

### 2. Basic editing — visual → source
- [ ] Click in visual pane and type or edit text
- [ ] Source pane updates with corresponding markdown within ~500 ms

### 3. Format buttons (both editors)
- [ ] **Bold:** Select text, click Bold (or Cmd/Ctrl+B) — works in source and in visual
- [ ] **Italic:** Select text, click Italic (or Cmd/Ctrl+I) — works in both
- [ ] **Heading:** Select a line, apply Heading 1 (or H2/H3) — works in both
- [ ] Changes sync in both directions

### 4. Sync both directions
- [ ] Edit in source → visual reflects it
- [ ] Edit in visual → source reflects it
- [ ] No infinite loops or console errors when switching between panes

### 5. Scroll sync
- [ ] Create a long document (e.g. 20+ lines)
- [ ] Scroll in source pane → visual pane scrolls roughly in proportion (or vice versa)
- [ ] No requirement for pixel-perfect sync; “roughly works” is enough

### 6. Keyboard shortcuts
- [ ] **Cmd+B** (Mac) or **Ctrl+B** (Windows/Linux): Bold
- [ ] **Cmd+I** / **Ctrl+I**: Italic
- [ ] **Cmd+S** / **Ctrl+S**: Save (if implemented; otherwise note as N/A)

### 7. Empty document
- [ ] New document or clear content so document is empty
- [ ] App does not crash; can type and see content appear in both panes

### 8. Page reload preserves content
- [ ] Type some content (e.g. `# Smoke test`)
- [ ] Reload the page (F5 or Cmd/Ctrl+R)
- [ ] Same content still appears (persisted)

### 9. Browsers
- [ ] **Chrome:** All of the above work
- [ ] **Firefox:** All of the above work (or note any differences)

---

**Sign-off:** _________________ Date: _________

**Notes:** (any failures or quirks to document for Known Limitations)
