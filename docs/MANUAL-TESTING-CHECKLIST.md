# KnightWriter — Manual Testing Checklist

Use this checklist before release (e.g. v1.0). Copy into a GitHub issue or tracker and assign to QA or dev. Check off each item as completed.

**Source:** Extracted from `Testing-Plan.md` Phase 4 (sections 4.1–4.11).  
**Focus:** Keyboard shortcuts, accessibility, cross-browser, edge cases.

---

### 4.1 Core Functionality
- [ ] **New document**: Create fresh document, starts empty
- [ ] **Open document**: Open existing .md file
- [ ] **Save document**: Save changes to file
- [ ] **Save As**: Save to new location
- [ ] **Auto-save**: Changes auto-save after 5 seconds of inactivity
- [ ] **Dirty indicator**: Dot appears in title when unsaved changes exist

### 4.2 Source Editor
- [ ] **Typing**: Text appears as you type
- [ ] **Syntax highlighting**: Markdown syntax is highlighted
- [ ] **Line numbers**: Visible and accurate
- [ ] **Scrolling**: Smooth scroll with mouse/trackpad
- [ ] **Selection**: Can select text with mouse/keyboard
- [ ] **Copy/paste**: Standard shortcuts work (Cmd+C, Cmd+V)
- [ ] **Undo/redo**: Cmd+Z, Cmd+Shift+Z work correctly

### 4.3 Visual Editor
- [ ] **Rich text display**: Formatted text renders correctly
- [ ] **Headings**: H1–H6 render with correct sizes
- [ ] **Bold/italic**: Inline formatting displays
- [ ] **Lists**: Ordered and unordered lists render
- [ ] **Code blocks**: Syntax highlighted code blocks
- [ ] **Links**: Clickable, opens in new tab
- [ ] **Images**: Display inline (if supported)
- [ ] **Task lists**: Checkboxes render and are interactive

### 4.4 Bidirectional Sync
- [ ] **Source → Visual**: Changes in source reflect in visual within 300ms
- [ ] **Visual → Source**: Changes in visual reflect in source within 500ms
- [ ] **No infinite loops**: Rapid switching doesn't cause loops
- [ ] **Fidelity**: MD → HTML → MD produces identical result
- [ ] **Active editor**: Only active editor triggers sync
- [ ] **Format preservation**: Complex formatting survives round-trip

### 4.5 Format Toolbar
- [ ] **Bold** (Cmd+B): Toggles bold formatting
- [ ] **Italic** (Cmd+I): Toggles italic formatting
- [ ] **Strikethrough**: Toggles strikethrough
- [ ] **Heading 1–6**: Changes paragraph to heading
- [ ] **Bullet list**: Creates unordered list
- [ ] **Numbered list**: Creates ordered list
- [ ] **Task list**: Creates checkbox list
- [ ] **Code block**: Creates fenced code block
- [ ] **Quote**: Creates blockquote
- [ ] **Link** (Cmd+K): Inserts link with dialog
- [ ] **Image**: Inserts image with dialog
- [ ] **Horizontal rule**: Inserts ---

### 4.6 Scroll Sync
- [ ] **Source → Visual**: Scrolling source scrolls visual proportionally
- [ ] **Visual → Source**: Scrolling visual scrolls source proportionally
- [ ] **Toggle on/off**: Button in toolbar enables/disables sync
- [ ] **Smooth scrolling**: No jittering or jumping
- [ ] **Large documents**: Works with 1000+ line documents
- [ ] **Pause during typing**: Doesn't interfere with active editing

### 4.7 Keyboard Shortcuts
- [ ] **Cmd+B**: Bold
- [ ] **Cmd+I**: Italic
- [ ] **Cmd+K**: Insert link
- [ ] **Cmd+S**: Save document
- [ ] **Cmd+N**: New document
- [ ] **Cmd+O**: Open document
- [ ] **Cmd+Shift+S**: Save As
- [ ] **Cmd+Z**: Undo
- [ ] **Cmd+Shift+Z**: Redo
- [ ] **Cmd+F**: Find in document
- [ ] **Cmd+,**: Open preferences (if implemented)

### 4.8 Edge Cases
- [ ] **Empty document**: Doesn't crash or show errors
- [ ] **Very large document** (100k+ chars): Remains responsive
- [ ] **Malformed markdown**: Handles gracefully (unclosed tags, etc.)
- [ ] **Unicode characters**: Emoji, Chinese, Arabic render correctly
- [ ] **Special characters**: <, >, &, quotes escaped properly
- [ ] **Rapid switching**: Quickly switching editors doesn't break sync
- [ ] **Rapid formatting**: Clicking toolbar buttons rapidly doesn't break
- [ ] **Network loss**: Graceful handling if external resources fail

### 4.9 Accessibility
- [ ] **Keyboard navigation**: Can tab through all interactive elements
- [ ] **Focus indicators**: Clear visual focus on buttons, editors
- [ ] **Screen reader**: NVDA/VoiceOver announces editor state
- [ ] **ARIA labels**: Buttons have accessible names
- [ ] **Contrast**: Text meets WCAG AA contrast ratios
- [ ] **Zoom**: UI works at 200% browser zoom

### 4.10 Cross-Browser Testing
- [ ] **Chrome**: All features work
- [ ] **Firefox**: All features work
- [ ] **Safari**: All features work
- [ ] **Edge**: All features work

### 4.11 Performance
- [ ] **Initial load**: App loads within 2 seconds
- [ ] **Typing latency**: <50ms from keystroke to screen update
- [ ] **Sync latency**: Source → Visual within 300ms
- [ ] **Memory usage**: No memory leaks during 1-hour session
- [ ] **CPU usage**: <10% CPU during idle
- [ ] **Large files**: 10k line document loads within 3 seconds

---

**Sign-off:** _________________ Date: _________
