```markdown
# KnightWriter - Professional Bidirectional Markdown Editor
## Comprehensive Implementation Guide

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Core Architecture Principles](#core-architecture-principles)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Phase 1: Core Implementation](#phase-1-core-implementation)
6. [Key Learnings from Production Editors](#key-learnings-from-production-editors)
7. [Testing & Quality Assurance](#testing--quality-assurance)
8. [Phase 2: Advanced Features](#phase-2-advanced-features)
9. [Common Pitfalls & Solutions](#common-pitfalls--solutions)
10. [Success Criteria](#success-criteria)

---

## Project Overview

Build a production-quality dual-pane markdown editor inspired by Editor.md, StackEdit, and HackMD. Both panes are fully editable with synchronized scrolling, intelligent diff-based updates, and professional UX polish.

### What Makes This Special
- **True bidirectional editing**: Both source (markdown) and visual (WYSIWYG) panes are fully editable
- **Synchronized scrolling**: Scroll one pane, the other follows proportionally
- **Intelligent sync**: Diff-based updates prevent flickering and preserve cursor position
- **Professional UX**: Toolbar shows active formatting, status bar shows real-time stats
- **Production-ready**: Uses ProseMirror (via TipTap) instead of raw contenteditable

### Target Users
- Writers who want markdown simplicity with WYSIWYG convenience
- Developers who need markdown for documentation but want live preview
- Anyone frustrated by traditional markdown editors that only preview

---

## Core Architecture Principles

### 1. Single Source of Truth
- The **markdown string** is the authoritative source
- All state derives from this markdown string
- Visual pane is a rendered view that can also edit the source
- Changes in either pane ultimately update the same markdown string

### 2. Sync Engine Rules (CRITICAL)

**These rules prevent infinite loops and ensure smooth UX:**

1. Only the **active/focused** pane triggers synchronization
2. Use a sync lock (`isSyncing` flag) to prevent infinite loops
3. **Cancel pending syncs** when new changes arrive (don't queue old updates)
4. Debounce changes:
   - 300ms for source pane (fast typing)
   - 500ms for visual pane (formatting operations)
   - Increase to 700ms for large documents (>100KB)

**Sync Flow:**
```
User types in SOURCE pane:
  → Check: activeEditor === 'source' && !isSyncing ✓
  → Debounce 300ms
  → Set isSyncing = true
  → Parse markdown to HTML
  → Apply diff-based update to VISUAL pane
  → Visual pane's onChange fires BUT isSyncing=true so it's ignored
  → Set isSyncing = false

User types in VISUAL pane:
  → Check: activeEditor === 'visual' && !isSyncing ✓
  → Debounce 500ms
  → Set isSyncing = true
  → Convert HTML to markdown
  → Update SOURCE pane
  → Source pane's onChange fires BUT isSyncing=true so it's ignored
  → Set isSyncing = false
```

### 3. Active Editor Tracking
- Track which pane has focus: `activeEditor: 'source' | 'visual'`
- Only the active editor's `onChange` events trigger sync
- Visual indicator (blue dot) shows which pane is active
- Format toolbar actions adapt to the active pane
- **Toolbar state updates** as cursor moves (show active formatting like bold/italic)

### 4. Scroll Synchronization

**How It Works:**
- Both panes scroll together proportionally
- Calculate scroll percentage: `scrollTop / (scrollHeight - clientHeight)`
- Map source line numbers to visual DOM elements using position mapping
- Temporarily disable during rapid typing (resume after 300ms idle)
- User can scroll either pane, the other follows
- Add toggle button to disable sync scrolling (some users prefer independent scrolling)

**Why It Matters:**
- Editor.md's scroll sync is its killer feature
- Provides spatial context - you always know where you are in the document
- Makes navigation between panes seamless

### 5. Diff-Based Updates

**Problem with Naive Approach:**
```javascript
// BAD: Regenerates entire HTML on every change
visualElement.innerHTML = markdownToHTML(markdown);
// Causes: flickering, lost cursor, poor performance
```

**Better Approach:**
```javascript
// GOOD: Update only changed portions
diffEngine.applyHTMLDiff(visualElement, oldMarkdown, newMarkdown, markdownToHTML);
// Result: smooth updates, preserved cursor, better performance
```

---

## Tech Stack

### Core Framework
- **React 18+** with TypeScript
- **Vite** for build tooling (fast, modern, better than CRA)
- Strict TypeScript configuration for type safety

### State Management
- **Zustand** (NOT Redux or Context API)
  - Simple, minimal boilerplate
  - Easy to debug with DevTools
  - No provider hell
  - Performance by default

### Editors

#### Source Pane: CodeMirror 6
**Why CodeMirror 6?**
- Industry standard for code/text editing
- Excellent performance (handles 1M+ line documents)
- Extensible architecture
- Built-in undo/redo, search, line numbers
- TypeScript support

**Required Packages:**
```bash
npm install @codemirror/state @codemirror/view @codemirror/commands 
npm install @codemirror/lang-markdown @codemirror/theme-one-dark
```

#### Visual Pane: TipTap (ProseMirror wrapper)
**Why TipTap instead of raw contenteditable?**
- contenteditable is unpredictable across browsers
- Browsers insert random HTML (`<div>`, `<span>`, `<font>`)
- TipTap/ProseMirror maintains a structured document model
- Full control over what HTML exists
- Built-in markdown serialization
- No browser quirks

**Required Packages:**
```bash
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-typography
npm install @tiptap/extension-task-list @tiptap/extension-task-item
npm install @tiptap/extension-code-block-lowlight prosemirror-markdown
```

### Markdown Processing

#### Markdown → HTML
- **markdown-it**: Fast, CommonMark compliant
- **markdown-it-gfm**: GitHub Flavored Markdown (tables, task lists, strikethrough)
- **markdown-it-anchor**: Auto-generate heading IDs for TOC and scroll sync

#### HTML → Markdown
- **turndown**: Reliable HTML to markdown conversion
- **turndown-plugin-gfm**: Handles GFM features (tables, task lists)

#### Why These Libraries?
- Used by GitHub, GitLab, StackEdit
- Battle-tested on millions of documents
- Active maintenance
- Excellent CommonMark compliance

### Performance & Utilities
- **diff-match-patch**: Google's diff algorithm for intelligent updates
- **lowlight**: Syntax highlighting (uses highlight.js)
- **lodash.debounce**: Debouncing utility
- **lodash.throttle**: Throttling for scroll events

### UI & Styling
- **Tailwind CSS**: Utility-first CSS framework
- **@tailwindcss/typography**: Beautiful prose styling
- **lucide-react**: Modern icon library (lightweight, tree-shakeable)
- **react-split**: Resizable pane divider with drag handle

---

## Project Structure

```
knightwriter/
├── src/
│   ├── components/
│   │   ├── Editor/
│   │   │   ├── SourcePane.tsx          # CodeMirror wrapper
│   │   │   ├── VisualPane.tsx          # TipTap wrapper
│   │   │   ├── EditorContainer.tsx     # Main split view + scroll sync
│   │   │   ├── StatusBar.tsx           # Word count, stats, sync status
│   │   │   └── ScrollSync.tsx          # Scroll synchronization logic
│   │   ├── Toolbar/
│   │   │   ├── FormatToolbar.tsx       # Bold, italic, headings, etc.
│   │   │   ├── ToolbarButton.tsx       # Reusable button component
│   │   │   └── ToolbarGroup.tsx        # Grouped buttons with dividers
│   │   └── Layout/
│   │       ├── Header.tsx              # App title, file name
│   │       └── AppLayout.tsx           # Overall layout
│   ├── store/
│   │   ├── documentStore.ts            # Zustand store for document state
│   │   └── uiStore.ts                  # UI preferences (theme, scroll sync)
│   ├── lib/
│   │   ├── markdown/
│   │   │   ├── markdownToHtml.ts       # markdown-it wrapper
│   │   │   ├── htmlToMarkdown.ts       # turndown wrapper
│   │   │   ├── markdownParser.ts       # Parse to AST
│   │   │   └── positionMapper.ts       # Map MD ↔ HTML positions
│   │   ├── sync/
│   │   │   ├── syncEngine.ts           # Core sync logic with cancellation
│   │   │   ├── diffEngine.ts           # Diff-based updates
│   │   │   ├── scrollSync.ts           # Scroll synchronization engine
│   │   │   └── debounce.ts             # Debounce utility
│   │   ├── codemirror/
│   │   │   ├── extensions.ts           # CM6 extensions
│   │   │   ├── theme.ts                # Custom theme
│   │   │   └── scrollExtension.ts      # Scroll position tracking
│   │   └── tiptap/
│   │       ├── extensions.ts           # TipTap extensions
│   │       └── scrollPlugin.ts         # Scroll position tracking plugin
│   ├── types/
│   │   └── index.ts                    # TypeScript types
│   ├── hooks/
│   │   ├── useScrollSync.ts            # Scroll sync React hook
│   │   └── useDebounce.ts              # Debounce hook
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

---

## Phase 1: Core Implementation

### Step 1: Project Setup

```bash
# Create Vite project
npm create vite@latest knightwriter -- --template react-ts
cd knightwriter
npm install

# Core dependencies
npm install zustand

# CodeMirror
npm install @codemirror/state @codemirror/view @codemirror/commands
npm install @codemirror/lang-markdown @codemirror/theme-one-dark

# TipTap
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-typography
npm install @tiptap/extension-task-list @tiptap/extension-task-item
npm install @tiptap/extension-code-block-lowlight prosemirror-markdown

# Markdown processing
npm install markdown-it markdown-it-gfm markdown-it-anchor
npm install turndown turndown-plugin-gfm
npm install -D @types/markdown-it @types/turndown

# Diff and syntax highlighting
npm install diff-match-patch lowlight
npm install -D @types/diff-match-patch

# UI components
npm install lucide-react react-split
npm install lodash.debounce lodash.throttle
npm install -D @types/react-split @types/lodash.debounce @types/lodash.throttle

# Tailwind CSS
npm install -D tailwindcss postcss autoprefixer @tailwindcss/typography
npx tailwindcss init -p
```

### Step 2: Zustand Store

**File: `src/store/documentStore.ts`**

```typescript
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export type EditorType = 'source' | 'visual';

interface ScrollPosition {
  source: number; // 0-1 percentage
  visual: number; // 0-1 percentage
}

interface DocumentState {
  // Document state
  markdown: string;
  isDirty: boolean;
  fileName: string | null;
  lastSaved: Date | null;
  
  // Sync state
  activeEditor: EditorType;
  isSyncing: boolean;
  pendingSyncCancelled: boolean; // For cancelling old syncs
  
  // Scroll state
  scrollPosition: ScrollPosition;
  scrollSyncEnabled: boolean;
  isScrolling: boolean; // true during programmatic scroll
  
  // Selection state (for toolbar updates)
  currentFormats: Set<string>; // e.g., ['bold', 'italic', 'heading-1']
  
  // Actions
  setMarkdown: (markdown: string) => void;
  updateFromSource: (markdown: string) => void;
  updateFromVisual: (html: string) => void;
  setActiveEditor: (editor: EditorType) => void;
  setIsSyncing: (syncing: boolean) => void;
  setPendingSyncCancelled: (cancelled: boolean) => void;
  setDirty: (dirty: boolean) => void;
  setFileName: (name: string | null) => void;
  
  // Scroll actions
  setScrollPosition: (editor: EditorType, position: number) => void;
  setScrollSyncEnabled: (enabled: boolean) => void;
  setIsScrolling: (scrolling: boolean) => void;
  
  // Format tracking
  updateCurrentFormats: (formats: Set<string>) => void;
  
  // File operations
  newDocument: () => void;
  markSaved: () => void;
}

export const useDocumentStore = create<DocumentState>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        markdown: '# Welcome to KnightWriter\n\nStart typing in either pane...',
        isDirty: false,
        fileName: null,
        lastSaved: null,
        activeEditor: 'source',
        isSyncing: false,
        pendingSyncCancelled: false,
        scrollPosition: { source: 0, visual: 0 },
        scrollSyncEnabled: true,
        isScrolling: false,
        currentFormats: new Set(),
        
        // Actions
        setMarkdown: (markdown) => set({ markdown, isDirty: true }),
        
        updateFromSource: (markdown) => set({ 
          markdown, 
          isDirty: true,
          pendingSyncCancelled: false 
        }),
        
        updateFromVisual: (html) => {
          // Implemented with htmlToMarkdown in sync engine
          set({ isDirty: true, pendingSyncCancelled: false });
        },
        
        setActiveEditor: (editor) => set({ activeEditor: editor }),
        setIsSyncing: (syncing) => set({ isSyncing: syncing }),
        setPendingSyncCancelled: (cancelled) => set({ pendingSyncCancelled: cancelled }),
        setDirty: (dirty) => set({ isDirty: dirty }),
        setFileName: (name) => set({ fileName: name }),
        
        // Scroll actions
        setScrollPosition: (editor, position) => set((state) => ({
          scrollPosition: {
            ...state.scrollPosition,
            [editor]: position
          }
        })),
        
        setScrollSyncEnabled: (enabled) => set({ scrollSyncEnabled: enabled }),
        setIsScrolling: (scrolling) => set({ isScrolling: scrolling }),
        
        // Format tracking
        updateCurrentFormats: (formats) => set({ currentFormats: formats }),
        
        // File operations
        newDocument: () => set({
          markdown: '',
          isDirty: false,
          fileName: null,
          lastSaved: null
        }),
        
        markSaved: () => set({
          isDirty: false,
          lastSaved: new Date()
        }),
      }),
      {
        name: 'knightwriter-storage',
        partialize: (state) => ({
          scrollSyncEnabled: state.scrollSyncEnabled,
          // Don't persist document content - only preferences
        }),
      }
    )
  )
);
```

### Step 3: Markdown Converters

**File: `src/lib/markdown/markdownToHtml.ts`**

```typescript
import MarkdownIt from 'markdown-it';
// @ts-ignore - no types available
import markdownItGfm from 'markdown-it-gfm';
import markdownItAnchor from 'markdown-it-anchor';

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true, // Convert \n to <br>
}).use(markdownItGfm)
  .use(markdownItAnchor, {
    permalink: false,
    slugify: (s: string) => s.toLowerCase().replace(/\s+/g, '-')
  });

// Custom renderer to add line number attributes for scroll sync
md.renderer.rules.heading_open = function (tokens, idx) {
  const token = tokens[idx];
  const line = token.map ? token.map[0] : 0;
  return `<${token.tag} data-line="${line}">`;
};

md.renderer.rules.paragraph_open = function (tokens, idx) {
  const token = tokens[idx];
  const line = token.map ? token.map[0] : 0;
  return `<p data-line="${line}">`;
};

md.renderer.rules.bullet_list_open = function (tokens, idx) {
  const token = tokens[idx];
  const line = token.map ? token.map[0] : 0;
  return `<ul data-line="${line}">`;
};

export const markdownToHtml = (markdown: string): string => {
  return md.render(markdown);
};

export const parseMarkdown = (markdown: string) => {
  return md.parse(markdown, {});
};
```

**File: `src/lib/markdown/htmlToMarkdown.ts`**

```typescript
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';

const turndownService = new TurndownService({
  headingStyle: 'atx', // Use # for headings
  codeBlockStyle: 'fenced',
  bulletListMarker: '*',
  emDelimiter: '*',
  strongDelimiter: '**',
});

// Add GFM support (tables, strikethrough, task lists)
turndownService.use(gfm);

// Custom rule to preserve line breaks
turndownService.addRule('lineBreak', {
  filter: 'br',
  replacement: () => '\n',
});

// Don't convert code block contents
turndownService.addRule('preserveCodeBlocks', {
  filter: (node) => {
    return node.nodeName === 'CODE' && node.parentNode?.nodeName === 'PRE';
  },
  replacement: (content) => {
    return content; // Keep as-is
  },
});

export const htmlToMarkdown = (html: string): string => {
  return turndownService.turndown(html);
};
```

### Step 4: Diff Engine

**File: `src/lib/sync/diffEngine.ts`**

```typescript
import { diff_match_patch, Diff } from 'diff-match-patch';

const dmp = new diff_match_patch();

/**
 * Apply diff-based updates to avoid regenerating entire HTML
 * This prevents flickering and preserves cursor position better
 */
export class DiffEngine {
  /**
   * Compute minimal changes between old and new markdown
   */
  computeDiff(oldText: string, newText: string): Diff[] {
    return dmp.diff_main(oldText, newText);
  }
  
  /**
   * Apply patches to HTML efficiently
   * Instead of innerHTML = newHTML, find changed sections and update only those
   */
  applyHTMLDiff(
    element: HTMLElement, 
    oldMarkdown: string, 
    newMarkdown: string,
    markdownToHtml: (md: string) => string
  ): void {
    const diffs = this.computeDiff(oldMarkdown, newMarkdown);
    
    // If changes are small, do targeted updates
    // If changes are large (>30% of document), do full update
    const totalLength = oldMarkdown.length + newMarkdown.length;
    const changeSize = diffs.reduce((sum, [op, text]) => 
      op !== 0 ? sum + text.length : sum, 0
    );
    
    const changePercentage = changeSize / totalLength;
    
    if (changePercentage > 0.3) {
      // Large change - just update innerHTML
      element.innerHTML = markdownToHtml(newMarkdown);
    } else {
      // Small change - do targeted update
      // This is complex - for MVP, just do full update
      // TODO: Implement smart DOM diffing using Virtual DOM or similar
      element.innerHTML = markdownToHtml(newMarkdown);
    }
  }
  
  /**
   * Check if two markdown strings are semantically identical
   * (ignoring whitespace differences that don't affect rendering)
   */
  areEquivalent(md1: string, md2: string): boolean {
    return md1.trim() === md2.trim();
  }
}

export const diffEngine = new DiffEngine();
```

### Step 5: Position Mapper (for Scroll Sync)

**File: `src/lib/markdown/positionMapper.ts`**

```typescript
/**
 * Maps positions between markdown source and rendered HTML
 * Essential for scroll synchronization
 */

interface Position {
  line: number;
  char: number;
  offset: number; // Character offset from start
}

export class PositionMapper {
  /**
   * Calculate line percentages for markdown
   * Returns array of [lineNumber, cumulativePercentage]
   */
  getMarkdownLineMap(markdown: string): Map<number, number> {
    const lines = markdown.split('\n');
    const totalLines = lines.length;
    const map = new Map<number, number>();
    
    for (let i = 0; i < totalLines; i++) {
      map.set(i, i / totalLines);
    }
    
    return map;
  }
  
  /**
   * Map markdown line to HTML element
   * Uses heading IDs and data attributes
   */
  findHTMLElementForMarkdownLine(
    container: HTMLElement,
    lineNumber: number,
    markdown: string
  ): HTMLElement | null {
    // Strategy:
    // 1. Look for heading with matching line number (via data-line attribute)
    // 2. Look for paragraph/list item near that line
    // 3. Fall back to percentage-based positioning
    
    const allElements = container.querySelectorAll('[data-line]');
    let closestElement: HTMLElement | null = null;
    let closestDistance = Infinity;
    
    allElements.forEach((el) => {
      const elLine = parseInt(el.getAttribute('data-line') || '0');
      const distance = Math.abs(elLine - lineNumber);
      
      if (distance < closestDistance) {
        closestDistance = distance;
        closestElement = el as HTMLElement;
      }
    });
    
    return closestElement;
  }
  
  /**
   * Calculate scroll percentage from element position
   */
  getScrollPercentageForElement(
    container: HTMLElement,
    element: HTMLElement
  ): number {
    const containerHeight = container.scrollHeight - container.clientHeight;
    const elementTop = element.offsetTop;
    
    if (containerHeight === 0) return 0;
    
    return Math.min(1, Math.max(0, elementTop / containerHeight));
  }
  
  /**
   * Convert markdown line number to scroll percentage
   */
  markdownLineToScrollPercentage(
    lineNumber: number,
    totalLines: number
  ): number {
    return Math.min(1, Math.max(0, lineNumber / totalLines));
  }
}

export const positionMapper = new PositionMapper();
```

### Step 6: Scroll Sync Engine

**File: `src/lib/sync/scrollSync.ts`**

```typescript
import throttle from 'lodash.throttle';
import { positionMapper } from '../markdown/positionMapper';
import { useDocumentStore } from '../../store/documentStore';

export class ScrollSyncEngine {
  private sourceScrollHandler: (() => void) | null = null;
  private visualScrollHandler: (() => void) | null = null;
  
  /**
   * Initialize scroll sync between source and visual panes
   */
  initialize(
    sourceElement: HTMLElement,
    visualElement: HTMLElement,
    getMarkdown: () => string
  ) {
    const store = useDocumentStore.getState();
    
    // Throttle scroll handlers to 60fps
    this.sourceScrollHandler = throttle(() => {
      if (!store.scrollSyncEnabled || store.isScrolling || store.activeEditor !== 'source') {
        return;
      }
      
      const scrollPercentage = sourceElement.scrollTop / 
        (sourceElement.scrollHeight - sourceElement.clientHeight);
      
      // Update store
      store.setScrollPosition('source', scrollPercentage);
      
      // Sync to visual
      this.syncToVisual(visualElement, scrollPercentage);
    }, 16); // ~60fps
    
    this.visualScrollHandler = throttle(() => {
      if (!store.scrollSyncEnabled || store.isScrolling || store.activeEditor !== 'visual') {
        return;
      }
      
      const scrollPercentage = visualElement.scrollTop / 
        (visualElement.scrollHeight - visualElement.clientHeight);
      
      // Update store
      store.setScrollPosition('visual', scrollPercentage);
      
      // Sync to source
      this.syncToSource(sourceElement, scrollPercentage);
    }, 16); // ~60fps
    
    sourceElement.addEventListener('scroll', this.sourceScrollHandler);
    visualElement.addEventListener('scroll', this.visualScrollHandler);
  }
  
  /**
   * Sync scroll position from source to visual
   */
  private syncToVisual(visualElement: HTMLElement, sourcePercentage: number) {
    const store = useDocumentStore.getState();
    store.setIsScrolling(true);
    
    const targetScroll = sourcePercentage * 
      (visualElement.scrollHeight - visualElement.clientHeight);
    
    visualElement.scrollTop = targetScroll;
    
    setTimeout(() => {
      store.setIsScrolling(false);
    }, 100);
  }
  
  /**
   * Sync scroll position from visual to source
   */
  private syncToSource(sourceElement: HTMLElement, visualPercentage: number) {
    const store = useDocumentStore.getState();
    store.setIsScrolling(true);
    
    const targetScroll = visualPercentage * 
      (sourceElement.scrollHeight - sourceElement.clientHeight);
    
    sourceElement.scrollTop = targetScroll;
    
    setTimeout(() => {
      store.setIsScrolling(false);
    }, 100);
  }
  
  /**
   * Clean up event listeners
   */
  cleanup(sourceElement: HTMLElement, visualElement: HTMLElement) {
    if (this.sourceScrollHandler) {
      sourceElement.removeEventListener('scroll', this.sourceScrollHandler);
    }
    if (this.visualScrollHandler) {
      visualElement.removeEventListener('scroll', this.visualScrollHandler);
    }
  }
  
  /**
   * Temporarily disable scroll sync (during rapid typing)
   */
  temporarilyDisable(durationMs: number = 300) {
    const store = useDocumentStore.getState();
    store.setScrollSyncEnabled(false);
    
    setTimeout(() => {
      store.setScrollSyncEnabled(true);
    }, durationMs);
  }
}

export const scrollSyncEngine = new ScrollSyncEngine();
```

### Step 7: Enhanced Sync Engine

**File: `src/lib/sync/syncEngine.ts`**

```typescript
import { markdownToHtml } from '../markdown/markdownToHtml';
import { htmlToMarkdown } from '../markdown/htmlToMarkdown';
import { diffEngine } from './diffEngine';
import { useDocumentStore } from '../../store/documentStore';

export class SyncEngine {
  private syncTimeout: NodeJS.Timeout | null = null;
  private lastMarkdown: string = '';
  
  /**
   * Cancel pending sync if new changes arrive
   */
  private cancelPendingSync() {
    if (this.syncTimeout) {
      clearTimeout(this.syncTimeout);
      this.syncTimeout = null;
      
      const store = useDocumentStore.getState();
      store.setPendingSyncCancelled(true);
    }
  }
  
  /**
   * Debounce function with cancellation support
   */
  private debounce(callback: () => void, delay: number) {
    this.cancelPendingSync();
    
    this.syncTimeout = setTimeout(() => {
      const store = useDocumentStore.getState();
      if (!store.pendingSyncCancelled) {
        callback();
      }
      store.setPendingSyncCancelled(false);
    }, delay);
  }
  
  /**
   * Source → Visual sync
   */
  syncSourceToVisual(
    markdown: string, 
    visualElement: HTMLElement,
    callback: (html: string) => void
  ) {
    this.debounce(() => {
      const store = useDocumentStore.getState();
      
      if (store.activeEditor !== 'source' || store.isSyncing) {
        return;
      }
      
      // Check if markdown actually changed
      if (diffEngine.areEquivalent(markdown, this.lastMarkdown)) {
        return;
      }
      
      store.setIsSyncing(true);
      
      try {
        const html = markdownToHtml(markdown);
        
        // Use diff-based update
        diffEngine.applyHTMLDiff(
          visualElement,
          this.lastMarkdown,
          markdown,
          markdownToHtml
        );
        
        this.lastMarkdown = markdown;
        callback(html);
      } catch (error) {
        console.error('Markdown parse error:', error);
        // Show error in visual pane
        visualElement.innerHTML = `<p class="text-red-600">Parse error: ${error}</p>`;
      } finally {
        setTimeout(() => store.setIsSyncing(false), 50);
      }
    }, 300);
  }
  
  /**
   * Visual → Source sync
   */
  syncVisualToSource(html: string, callback: (markdown: string) => void) {
    this.debounce(() => {
      const store = useDocumentStore.getState();
      
      if (store.activeEditor !== 'visual' || store.isSyncing) {
        return;
      }
      
      store.setIsSyncing(true);
      
      try {
        const markdown = htmlToMarkdown(html);
        
        // Check if it actually changed
        if (!diffEngine.areEquivalent(markdown, this.lastMarkdown)) {
          this.lastMarkdown = markdown;
          callback(markdown);
        }
      } catch (error) {
        console.error('HTML to markdown conversion error:', error);
      } finally {
        setTimeout(() => store.setIsSyncing(false), 50);
      }
    }, 500); // Longer debounce for visual editing
  }
}

export const syncEngine = new SyncEngine();
```

### Step 8: Source Pane (CodeMirror)

**File: `src/components/Editor/SourcePane.tsx`**

```typescript
import React, { useEffect, useRef } from 'react';
import { EditorView, basicSetup } from 'codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorState } from '@codemirror/state';
import { useDocumentStore } from '../../store/documentStore';
import { syncEngine } from '../../lib/sync/syncEngine';

interface SourcePaneProps {
  onVisualUpdate: (html: string) => void;
  visualElement: HTMLElement | null;
}

export const SourcePane: React.FC<SourcePaneProps> = ({ 
  onVisualUpdate,
  visualElement 
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  
  const { 
    markdown, 
    activeEditor, 
    isSyncing, 
    setActiveEditor, 
    updateFromSource 
  } = useDocumentStore();
  
  useEffect(() => {
    if (!editorRef.current) return;
    
    const startState = EditorState.create({
      doc: markdown,
      extensions: [
        basicSetup,
        markdown(),
        oneDark,
        EditorView.updateListener.of((update) => {
          if (update.docChanged && !isSyncing && activeEditor === 'source') {
            const newMarkdown = update.state.doc.toString();
            updateFromSource(newMarkdown);
            
            // Trigger sync to visual pane
            if (visualElement) {
              syncEngine.syncSourceToVisual(
                newMarkdown, 
                visualElement,
                onVisualUpdate
              );
            }
          }
        }),
        EditorView.domEventHandlers({
          focus: () => {
            setActiveEditor('source');
          },
        }),
      ],
    });
    
    const view = new EditorView({
      state: startState,
      parent: editorRef.current,
    });
    
    viewRef.current = view;
    
    return () => {
      view.destroy();
    };
  }, [visualElement]);
  
  // Update editor when markdown changes from visual pane
  useEffect(() => {
    if (viewRef.current && activeEditor === 'visual' && !isSyncing) {
      const currentDoc = viewRef.current.state.doc.toString();
      if (currentDoc !== markdown) {
        viewRef.current.dispatch({
          changes: {
            from: 0,
            to: currentDoc.length,
            insert: markdown,
          },
        });
      }
    }
  }, [markdown, activeEditor, isSyncing]);
  
  return (
    <div className="flex flex-col h-full">
      <div className="bg-gray-100 px-4 py-2 border-b border-gray-300">
        <span className={`text-sm font-medium ${
          activeEditor === 'source' ? 'text-blue-600' : 'text-gray-600'
        }`}>
          Markdown Source {activeEditor === 'source' && '●'}
        </span>
      </div>
      <div ref={editorRef} className="flex-1 overflow-auto" />
    </div>
  );
};
```

### Step 9: Visual Pane (TipTap)

**File: `src/components/Editor/VisualPane.tsx`**

```typescript
import React, { useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Typography from '@tiptap/extension-typography';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { lowlight } from 'lowlight';
import { useDocumentStore } from '../../store/documentStore';
import { syncEngine } from '../../lib/sync/syncEngine';
import { markdownToHtml } from '../../lib/markdown/markdownToHtml';

interface VisualPaneProps {
  onSourceUpdate: (markdown: string) => void;
  onEditorReady: (element: HTMLElement) => void;
}

export const VisualPane: React.FC<VisualPaneProps> = ({ 
  onSourceUpdate,
  onEditorReady 
}) => {
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const { 
    markdown, 
    activeEditor, 
    isSyncing, 
    setActiveEditor,
    updateCurrentFormats 
  } = useDocumentStore();
  
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        codeBlock: false, // Disable default code block
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
      Typography,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
    ],
    content: markdownToHtml(markdown),
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none p-4',
      },
    },
    onUpdate: ({ editor }) => {
      if (!isSyncing && activeEditor === 'visual') {
        const html = editor.getHTML();
        
        // Trigger sync to source pane
        syncEngine.syncVisualToSource(html, (newMarkdown) => {
          onSourceUpdate(newMarkdown);
        });
      }
    },
    onFocus: () => {
      setActiveEditor('visual');
    },
    onSelectionUpdate: ({ editor }) => {
      // Update toolbar state
      const formats = new Set<string>();
      
      if (editor.isActive('bold')) formats.add('bold');
      if (editor.isActive('italic')) formats.add('italic');
      if (editor.isActive('strike')) formats.add('strike');
      if (editor.isActive('code')) formats.add('code');
      if (editor.isActive('heading', { level: 1 })) formats.add('h1');
      if (editor.isActive('heading', { level: 2 })) formats.add('h2');
      if (editor.isActive('bulletList')) formats.add('list');
      if (editor.isActive('orderedList')) formats.add('orderedList');
      if (editor.isActive('taskList')) formats.add('taskList');
      if (editor.isActive('link')) formats.add('link');
      
      updateCurrentFormats(formats);
    },
  });
  
  // Notify parent when editor element is ready
  useEffect(() => {
    if (editor && editorContainerRef.current) {
      const editorElement = editorContainerRef.current.querySelector('.ProseMirror');
      if (editorElement) {
        onEditorReady(editorElement as HTMLElement);
      }
    }
  }, [editor, onEditorReady]);
  
  // Update editor when markdown changes from source pane
  useEffect(() => {
    if (editor && activeEditor === 'source' && !isSyncing) {
      const html = markdownToHtml(markdown);
      editor.commands.setContent(html, false); // false = don't trigger onUpdate
    }
  }, [markdown, activeEditor, isSyncing, editor]);
  
  return (
    <div className="flex flex-col h-full">
      <div className="bg-gray-100 px-4 py-2 border-b border-gray-300">
        <span className={`text-sm font-medium ${
          activeEditor === 'visual' ? 'text-blue-600' : 'text-gray-600'
        }`}>
          Formatted Preview {activeEditor === 'visual' && '●'}
        </span>
      </div>
      <div ref={editorContainerRef} className="flex-1 overflow-auto bg-white">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};
```

### Step 10: Format Toolbar

**File: `src/components/Toolbar/FormatToolbar.tsx`**

```typescript
import React from 'react';
import { 
  Bold, Italic, Strikethrough, Code, 
  Heading1, Heading2, Heading3,
  List, ListOrdered, CheckSquare,
  Link, Image, Quote
} from 'lucide-react';
import { useDocumentStore } from '../../store/documentStore';
import { Editor as TipTapEditor } from '@tiptap/react';
import { EditorView as CodeMirrorView } from '@codemirror/view';

interface ToolbarButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({ 
  icon, 
  label, 
  onClick, 
  isActive,
  disabled 
}) => (
  <button
    onClick={onClick}
    title={label}
    disabled={disabled}
    className={`p-2 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
      isActive 
        ? 'bg-blue-100 text-blue-600' 
        : 'hover:bg-gray-100 text-gray-700'
    }`}
  >
    {icon}
  </button>
);

interface FormatToolbarProps {
  sourceEditor?: CodeMirrorView;
  visualEditor?: TipTapEditor;
}

export const FormatToolbar: React.FC<FormatToolbarProps> = ({ 
  sourceEditor, 
  visualEditor 
}) => {
  const { activeEditor, currentFormats } = useDocumentStore();
  
  const applyFormat = (format: string) => {
    if (activeEditor === 'source' && sourceEditor) {
      const state = sourceEditor.state;
      const selection = state.selection.main;
      const selectedText = state.doc.sliceString(selection.from, selection.to);
      
      let newText = '';
      let cursorOffset = 0;
      
      switch (format) {
        case 'bold':
          newText = `**${selectedText}**`;
          cursorOffset = 2;
          break;
        case 'italic':
          newText = `*${selectedText}*`;
          cursorOffset = 1;
          break;
        case 'strike':
          newText = `~~${selectedText}~~`;
          cursorOffset = 2;
          break;
        case 'code':
          newText = `\`${selectedText}\``;
          cursorOffset = 1;
          break;
        case 'h1':
          newText = `# ${selectedText}`;
          cursorOffset = 2;
          break;
        case 'h2':
          newText = `## ${selectedText}`;
          cursorOffset = 3;
          break;
        case 'h3':
          newText = `### ${selectedText}`;
          cursorOffset = 4;
          break;
        case 'list':
          newText = `* ${selectedText}`;
          cursorOffset = 2;
          break;
        case 'orderedList':
          newText = `1. ${selectedText}`;
          cursorOffset = 3;
          break;
        case 'taskList':
          newText = `- [ ] ${selectedText}`;
          cursorOffset = 6;
          break;
        case 'link':
          newText = `[${selectedText}](url)`;
          cursorOffset = 1;
          break;
        case 'quote':
          newText = `> ${selectedText}`;
          cursorOffset = 2;
          break;
        default:
          return;
      }
      
      sourceEditor.dispatch({
        changes: {
          from: selection.from,
          to: selection.to,
          insert: newText,
        },
        selection: {
          anchor: selection.from + cursorOffset,
          head: selection.from + cursorOffset + selectedText.length,
        },
      });
      
      sourceEditor.focus();
      
    } else if (activeEditor === 'visual' && visualEditor) {
      switch (format) {
        case 'bold':
          visualEditor.chain().focus().toggleBold().run();
          break;
        case 'italic':
          visualEditor.chain().focus().toggleItalic().run();
          break;
        case 'strike':
          visualEditor.chain().focus().toggleStrike().run();
          break;
        case 'code':
          visualEditor.chain().focus().toggleCode().run();
          break;
        case 'h1':
          visualEditor.chain().focus().toggleHeading({ level: 1 }).run();
          break;
        case 'h2':
          visualEditor.chain().focus().toggleHeading({ level: 2 }).run();
          break;
        case 'h3':
          visualEditor.chain().focus().toggleHeading({ level: 3 }).run();
          break;
        case 'list':
          visualEditor.chain().focus().toggleBulletList().run();
          break;
        case 'orderedList':
          visualEditor.chain().focus().toggleOrderedList().run();
          break;
        case 'taskList':
          visualEditor.chain().focus().toggleTaskList().run();
          break;
        case 'link':
          const url = window.prompt('Enter URL:');
          if (url) {
            visualEditor.chain().focus().setLink({ href: url }).run();
          }
          break;
        case 'quote':
          visualEditor.chain().focus().toggleBlockquote().run();
          break;
      }
    }
  };
  
  const isActive = (format: string) => {
    return currentFormats.has(format);
  };
  
  return (
    <div className="flex items-center space-x-1 px-4 py-2 bg-white border-b border-gray-200 overflow-x-auto">
      {/* Text Formatting */}
      <div className="flex items-center space-x-1">
        <ToolbarButton
          icon={<Bold className="w-4 h-4" />}
          label="Bold (Ctrl+B)"
          onClick={() => applyFormat('bold')}
          isActive={isActive('bold')}
        />
        <ToolbarButton
          icon={<Italic className="w-4 h-4" />}
          label="Italic (Ctrl+I)"
          onClick={() => applyFormat('italic')}
          isActive={isActive('italic')}
        />
        <ToolbarButton
          icon={<Strikethrough className="w-4 h-4" />}
          label="Strikethrough"
          onClick={() => applyFormat('strike')}
          isActive={isActive('strike')}
        />
        <ToolbarButton
          icon={<Code className="w-4 h-4" />}
          label="Inline Code"
          onClick={() => applyFormat('code')}
          isActive={isActive('code')}
        />
      </div>
      
      <div className="w-px h-6 bg-gray-300 mx-2" />
      
      {/* Headings */}
      <div className="flex items-center space-x-1">
        <ToolbarButton
          icon={<Heading1 className="w-4 h-4" />}
          label="Heading 1"
          onClick={() => applyFormat('h1')}
          isActive={isActive('h1')}
        />
        <ToolbarButton
          icon={<Heading2 className="w-4 h-4" />}
          label="Heading 2"
          onClick={() => applyFormat('h2')}
          isActive={isActive('h2')}
        />
        <ToolbarButton
          icon={<Heading3 className="w-4 h-4" />}
          label="Heading 3"
          onClick={() => applyFormat('h3')}
          isActive={isActive('h3')}
        />
      </div>
      
      <div className="w-px h-6 bg-gray-300 mx-2" />
      
      {/* Lists */}
      <div className="flex items-center space-x-1">
        <ToolbarButton
          icon={<List className="w-4 h-4" />}
          label="Bullet List"
          onClick={() => applyFormat('list')}
          isActive={isActive('list')}
        />
        <ToolbarButton
          icon={<ListOrdered className="w-4 h-4" />}
          label="Numbered List"
          onClick={() => applyFormat('orderedList')}
          isActive={isActive('orderedList')}
        />
        <ToolbarButton
          icon={<CheckSquare className="w-4 h-4" />}
          label="Task List"
          onClick={() => applyFormat('taskList')}
          isActive={isActive('taskList')}
        />
      </div>
      
      <div className="w-px h-6 bg-gray-300 mx-2" />
      
      {/* Insert */}
      <div className="flex items-center space-x-1">
        <ToolbarButton
          icon={<Link className="w-4 h-4" />}
          label="Insert Link"
          onClick={() => applyFormat('link')}
          isActive={isActive('link')}
        />
        <ToolbarButton
          icon={<Quote className="w-4 h-4" />}
          label="Quote"
          onClick={() => applyFormat('quote')}
          isActive={isActive('quote')}
        />
        <ToolbarButton
          icon={<Image className="w-4 h-4" />}
          label="Insert Image (Phase 2)"
          onClick={() => {}}
          disabled={true}
        />
      </div>
    </div>
  );
};
```

### Step 11: Status Bar

**File: `src/components/Editor/StatusBar.tsx`**

```typescript
import React from 'react';
import { useDocumentStore } from '../../store/documentStore';
import { Link2, Link2Off, Clock } from 'lucide-react';

export const StatusBar: React.FC = () => {
  const { 
    markdown, 
    activeEditor, 
    isSyncing, 
    isDirty,
    scrollSyncEnabled,
    setScrollSyncEnabled,
    lastSaved,
    fileName
  } = useDocumentStore();
  
  const wordCount = markdown.split(/\s+/).filter(Boolean).length;
  const charCount = markdown.length;
  const lineCount = markdown.split('\n').length;
  
  const formatLastSaved = (date: Date | null) => {
    if (!date) return 'Never';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    return date.toLocaleTimeString();
  };
  
  return (
    <div className="bg-gray-100 border-t border-gray-300 px-4 py-2 flex items-center justify-between text-xs text-gray-600">
      <div className="flex items-center space-x-4">
        {/* Active Editor */}
        <span>
          Active: <span className="font-semibold capitalize">{activeEditor}</span>
        </span>
        
        {/* Sync Status */}
        {isSyncing && (
          <span className="text-blue-600 font-medium animate-pulse">
            ● Syncing...
          </span>
        )}
        
        {/* Dirty State */}
        {isDirty && (
          <span className="text-orange-600 font-medium">● Unsaved</span>
        )}
        
        {/* Last Saved */}
        {!isDirty && lastSaved && (
          <span className="text-green-600 flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>Saved {formatLastSaved(lastSaved)}</span>
          </span>
        )}
        
        {/* Scroll Sync Toggle */}
        <button
          onClick={() => setScrollSyncEnabled(!scrollSyncEnabled)}
          className={`flex items-center space-x-1 px-2 py-1 rounded transition-colors ${
            scrollSyncEnabled 
              ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' 
              : 'hover:bg-gray-200'
          }`}
          title={scrollSyncEnabled ? 'Disable scroll sync' : 'Enable scroll sync'}
        >
          {scrollSyncEnabled ? (
            <>
              <Link2 className="w-3 h-3" />
              <span>Scroll sync</span>
            </>
          ) : (
            <>
              <Link2Off className="w-3 h-3" />
              <span>Independent</span>
            </>
          )}
        </button>
      </div>
      
      {/* Statistics */}
      <div className="flex items-center space-x-4">
        {fileName && (
          <span className="text-gray-500">{fileName}</span>
        )}
        <span>Words: <span className="font-semibold">{wordCount}</span></span>
        <span>Chars: <span className="font-semibold">{charCount}</span></span>
        <span>Lines: <span className="font-semibold">{lineCount}</span></span>
      </div>
    </div>
  );
};
```

### Step 12: Editor Container with Scroll Sync

**File: `src/components/Editor/EditorContainer.tsx`**

```typescript
import React, { useState, useEffect, useRef } from 'react';
import Split from 'react-split';
import { SourcePane } from './SourcePane';
import { VisualPane } from './VisualPane';
import { FormatToolbar } from '../Toolbar/FormatToolbar';
import { useDocumentStore } from '../../store/documentStore';
import { scrollSyncEngine } from '../../lib/sync/scrollSync';

export const EditorContainer: React.FC = () => {
  const [visualElement, setVisualElement] = useState<HTMLElement | null>(null);
  const [sourceElement, setSourceElement] = useState<HTMLElement | null>(null);
  const sourceContainerRef = useRef<HTMLDivElement>(null);
  
  const { markdown, setMarkdown } = useDocumentStore();
  
  // Initialize scroll sync when both elements are ready
  useEffect(() => {
    if (sourceElement && visualElement) {
      scrollSyncEngine.initialize(
        sourceElement,
        visualElement,
        () => markdown
      );
      
      return () => {
        scrollSyncEngine.cleanup(sourceElement, visualElement);
      };
    }
  }, [sourceElement, visualElement, markdown]);
  
  // Get source editor element
  useEffect(() => {
    if (sourceContainerRef.current) {
      const cmScroller = sourceContainerRef.current.querySelector('.cm-scroller');
      if (cmScroller) {
        setSourceElement(cmScroller as HTMLElement);
      }
    }
  }, []);
  
  const handleVisualUpdate = (html: string) => {
    // Visual HTML updated, nothing else needed
  };
  
  const handleSourceUpdate = (markdown: string) => {
    setMarkdown(markdown);
  };
  
  const handleVisualEditorReady = (element: HTMLElement) => {
    setVisualElement(element);
  };
  
  return (
    <div className="flex flex-col h-full">
      <FormatToolbar />
      
      <Split
        className="flex flex-1 overflow-hidden"
        sizes={[50, 50]}
        minSize={300}
        gutterSize={8}
        gutterAlign="center"
        snapOffset={30}
        dragInterval={1}
        direction="horizontal"
        cursor="col-resize"
      >
        <div ref={sourceContainerRef} className="h-full">
          <SourcePane 
            onVisualUpdate={handleVisualUpdate}
            visualElement={visualElement}
          />
        </div>
        
        <VisualPane 
          onSourceUpdate={handleSourceUpdate}
          onEditorReady={handleVisualEditorReady}
        />
      </Split>
    </div>
  );
};
```

### Step 13: Main App Layout

**File: `src/App.tsx`**

```typescript
import React from 'react';
import { EditorContainer } from './components/Editor/EditorContainer';
import { StatusBar } from './components/Editor/StatusBar';
import { useDocumentStore } from './store/documentStore';
import { FileText, Save, FolderOpen, FilePlus } from 'lucide-react';

function App() {
  const { fileName, isDirty, newDocument } = useDocumentStore();
  
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileText className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-semibold text-gray-800">KnightWriter</h1>
            {fileName && (
              <span className="text-sm text-gray-600">{fileName}</span>
            )}
            {isDirty && (
              <span className="text-sm text-orange-600 font-medium">●</span>
            )}
          </div>
          
          {/* File Actions (Phase 2) */}
          <div className="flex items-center space-x-2">
            <button
              onClick={newDocument}
              className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              title="New Document"
            >
              <FilePlus className="w-4 h-4" />
              <span>New</span>
            </button>
            <button
              disabled
              className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-gray-100 rounded opacity-50 cursor-not-allowed"
              title="Open (Phase 2)"
            >
              <FolderOpen className="w-4 h-4" />
              <span>Open</span>
            </button>
            <button
              disabled
              className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded opacity-50 cursor-not-allowed"
              title="Save (Phase 2)"
            >
              <Save className="w-4 h-4" />
              <span>Save</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Editor */}
      <EditorContainer />
      
      {/* Status Bar */}
      <StatusBar />
    </div>
  );
}

export default App;
```

### Step 14: Global Styles

**File: `src/index.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#root {
  height: 100vh;
  overflow: hidden;
}

/* CodeMirror Styles */
.cm-editor {
  height: 100%;
  font-size: 14px;
}

.cm-scroller {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'Courier New', monospace;
  line-height: 1.6;
}

.cm-content {
  padding: 16px;
}

/* TipTap Styles */
.ProseMirror {
  min-height: 100%;
  padding: 16px;
}

.ProseMirror:focus {
  outline: none;
}

.ProseMirror p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  float: left;
  color: #adb5bd;
  pointer-events: none;
  height: 0;
}

/* Task List Styles */
.ProseMirror ul[data-type="taskList"] {
  list-style: none;
  padding-left: 0;
}

.ProseMirror ul[data-type="taskList"] li {
  display: flex;
  align-items: flex-start;
}

.ProseMirror ul[data-type="taskList"] li > label {
  flex: 0 0 auto;
  margin-right: 0.5rem;
  user-select: none;
}

.ProseMirror ul[data-type="taskList"] li > div {
  flex: 1 1 auto;
}

/* Code Block Styles */
.ProseMirror pre {
  background: #1e1e1e;
  color: #d4d4d4;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
}

.ProseMirror pre code {
  color: inherit;
  padding: 0;
  background: none;
  font-size: 0.875rem;
}

/* Split Pane Gutter */
.gutter {
  background-color: #e5e7eb;
  background-repeat: no-repeat;
  background-position: 50%;
  transition: background-color 0.2s;
}

.gutter:hover {
  background-color: #d1d5db;
}

.gutter.gutter-horizontal {
  background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAeCAYAAADkftS9AAAAIklEQVQoU2M4c+bMfxAGAgYYmwGrIIiDjrELjpo5aiZeMwF+yNnOs5KSvgAAAABJRU5ErkJggg==');
  cursor: col-resize;
}

/* Scrollbar Styles */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Animations */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

### Step 15: Tailwind Configuration

**File: `tailwind.config.js`**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: '#374151',
            a: {
              color: '#3b82f6',
              textDecoration: 'underline',
              '&:hover': {
                color: '#2563eb',
              },
            },
            strong: {
              color: '#111827',
              fontWeight: '600',
            },
            code: {
              color: '#111827',
              backgroundColor: '#f3f4f6',
              padding: '0.25rem 0.375rem',
              borderRadius: '0.25rem',
              fontWeight: '400',
            },
            'code::before': {
              content: '""',
            },
            'code::after': {
              content: '""',
            },
            pre: {
              backgroundColor: '#1e1e1e',
              color: '#d4d4d4',
            },
            h1: {
              color: '#111827',
              fontWeight: '700',
            },
            h2: {
              color: '#111827',
              fontWeight: '600',
            },
            h3: {
              color: '#111827',
              fontWeight: '600',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
```

### Step 16: TypeScript Configuration

**File: `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

---

## Key Learnings from Production Editors

### 1. Scroll Synchronization (Editor.md's Killer Feature)
- **Why it matters**: Provides spatial context, makes navigation seamless
- **How it works**: Calculate scroll percentage, map source lines to HTML elements
- **User control**: Toggle button to enable/disable sync
- **Performance**: Throttle to 60fps, temporarily disable during rapid typing

### 2. Diff-Based Updates (StackEdit's Approach)
- **Problem**: Regenerating entire HTML causes flickering and lost cursor
- **Solution**: Use diff algorithms to update only changed portions
- **Library**: diff-match-patch (Google's library)
- **Benefit**: Smooth updates, preserved cursor, 10x better performance

### 3. Position Mapping (ProseMirror's Core Feature)
- **Purpose**: Map markdown character offsets to HTML DOM positions
- **Essential for**: Scroll sync, cursor preservation, error highlighting
- **Implementation**: Use `data-line` attributes, element offsetTop, scroll percentage

### 4. Toolbar State Updates (All Editors)
- **Behavior**: Toolbar buttons show active state (bold button pressed when text is bold)
- **Trigger**: Updates as cursor moves, not just on clicks
- **Implementation**: Listen to TipTap's `selectionUpdate` event

### 5. Code Block Handling
- **Challenge**: Code blocks need special treatment
- **Solution**: Use CodeBlockLowlight extension with syntax highlighting
- **Important**: Don't convert code block contents during HTML↔Markdown

### 6. Performance Patterns
- **Debouncing**: 300ms for source, 500ms for visual
- **Throttling**: 16ms (60fps) for scroll events
- **Cancellation**: Cancel pending syncs when new changes arrive
- **Large docs**: Increase debounce to 700ms for >100KB documents

### 7. Error Recovery
- **Graceful degradation**: Malformed markdown shouldn't crash the editor
- **User feedback**: Show parse errors in visual pane
- **Fix suggestions**: Offer solutions for common mistakes

---

## Testing & Quality Assurance

### Testing Checklist

#### Basic Functionality
- [ ] Type in source pane → see rendered in visual pane
- [ ] Type in visual pane → see markdown in source pane
- [ ] Format toolbar works in both panes
- [ ] Toolbar buttons show active state
- [ ] No sync loops or infinite updates
- [ ] No console errors during normal use

#### Scroll Synchronization
- [ ] Scroll source → visual follows proportionally
- [ ] Scroll visual → source follows proportionally
- [ ] Toggle scroll sync off → independent scrolling
- [ ] Scroll sync smooth at 60fps
- [ ] Scroll sync temporarily disables during typing

#### Performance
- [ ] Paste 1000 lines → no lag
- [ ] Rapid typing → debouncing works correctly
- [ ] Large document scroll → smooth performance
- [ ] Memory usage stable (no leaks)

#### Edge Cases
- [ ] Empty document
- [ ] Very long document (10,000+ lines)
- [ ] Rapid switching between panes
- [ ] Formatting with no selection
- [ ] Nested formatting: `**bold *italic* bold**`
- [ ] Complex tables with merged cells
- [ ] Task lists with nested items
- [ ] Code blocks with special characters

#### Markdown Features
- [ ] Headings (# ## ###)
- [ ] Bold (**text**)
- [ ] Italic (*text*)
- [ ] Strikethrough (~~text~~)
- [ ] Inline code (`code`)
- [ ] Code blocks with syntax highlighting
- [ ] Bullet lists (* item)
- [ ] Numbered lists (1. item)
- [ ] Task lists (- [ ] todo)
- [ ] Links ([text](url))
- [ ] Blockquotes (> quote)
- [ ] Horizontal rules (---)
- [ ] Tables (GFM tables)

#### Round-Trip Fidelity
- [ ] MD → HTML → MD produces identical result
- [ ] No extra whitespace added
- [ ] No lost formatting
- [ ] Code blocks preserved exactly

### Automated Testing

**Unit Tests (Vitest):**
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

**Test Files:**
- `src/lib/markdown/markdownToHtml.test.ts` - Test markdown parsing
- `src/lib/markdown/htmlToMarkdown.test.ts` - Test HTML conversion
- `src/lib/sync/diffEngine.test.ts` - Test diff algorithm
- `src/store/documentStore.test.ts` - Test state management

### Performance Monitoring

**Add Performance Marks:**
```typescript
performance.mark('sync-start');
// ... sync logic ...
performance.mark('sync-end');
performance.measure('sync-duration', 'sync-start', 'sync-end');

const measures = performance.getEntriesByType('measure');
const syncDuration = measures[measures.length - 1].duration;

if (syncDuration > 100) {
  console.warn('Slow sync detected:', syncDuration, 'ms');
}
```

---

## Phase 2: Advanced Features

### File Operations
- **New document**: Clear editor, reset state
- **Open file**: Use File System Access API with fallback to file input
- **Save file**: Use File System Access API with fallback to download
- **Auto-save**: Save to localStorage every 30 seconds
- **Crash recovery**: Restore from localStorage on reload

### Images & Media
- **Drag-drop images**: Show placeholder, upload, replace with URL
- **Paste images**: Capture clipboard, convert to data URL or upload
- **Image preview**: Show thumbnails in visual pane
- **Video embeds**: Support YouTube, Vimeo links

### Export & Share
- **Export as HTML**: Full standalone HTML file
- **Export as PDF**: Use browser print dialog
- **Copy as HTML**: Rich text for pasting into Word/Google Docs
- **Generate shareable link**: Upload to cloud, generate short URL

### Collaboration (Phase 3)
- **Real-time sync**: WebSocket or WebRTC
- **Conflict resolution**: Operational transformation or CRDT
- **Cursor presence**: Show other users' cursors
- **Comments**: Inline comments and threads

### Advanced Editing
- **Find & replace**: In-document search with regex support
- **Multi-cursor**: Edit multiple locations simultaneously
- **Vim mode**: Vim keybindings for power users
- **Spell check**: Browser spell checker or custom dictionary

### Customization
- **Themes**: Light, dark, custom color schemes
- **Font settings**: Family, size, line height
- **Editor layout**: Horizontal/vertical split, hide source/visual
- **Keybindings**: Customizable shortcuts

---

## Common Pitfalls & Solutions

### Pitfall 1: Sync Loops
**Problem**: Visual updates source, source updates visual, repeat infinitely

**Solution**:
```typescript
// ALWAYS check these before syncing
if (activeEditor !== 'source' || isSyncing) return;
if (activeEditor !== 'visual' || isSyncing) return;
```

### Pitfall 2: Lost Cursor Position
**Problem**: Cursor jumps to top after sync

**Solution**:
- Use TipTap's `setContent(html, false)` - the `false` prevents triggering onUpdate
- For CodeMirror, check `isSyncing` before dispatching changes

### Pitfall 3: Flickering During Typing
**Problem**: Visual pane flickers on every keystroke

**Solution**:
- Debounce sync (300ms minimum)
- Use diff-based updates instead of full innerHTML replacement
- Cancel pending syncs when new changes arrive

### Pitfall 4: Poor Performance with Large Documents
**Problem**: Editor becomes slow with 1000+ lines

**Solution**:
- Increase debounce delay (700ms for >100KB)
- Use virtual scrolling (only render visible content)
- Consider moving markdown-it to Web Worker

### Pitfall 5: Markdown Round-Trip Issues
**Problem**: MD → HTML → MD produces different result

**Solution**:
- Use turndown-plugin-gfm for GFM features
- Configure turndown to match markdown-it's output
- Test round-trip fidelity in unit tests

### Pitfall 6: Browser Compatibility
**Problem**: File System Access API not available in all browsers

**Solution**:
- Feature detection: `if ('showOpenFilePicker' in window)`
- Fallback to traditional file input/download
- Polyfills for older browsers

### Pitfall 7: Memory Leaks
**Problem**: Editor uses more memory over time

**Solution**:
- Clean up event listeners in useEffect cleanup
- Cancel pending timeouts/intervals
- Dispose of CodeMirror/TipTap instances properly

---

## Success Criteria

### Phase 1 Complete When:
- ✅ Bidirectional editing works flawlessly
- ✅ Scroll sync works (can be toggled)
- ✅ Toolbar shows active formatting state
- ✅ No performance issues with large documents (tested up to 10,000 lines)
- ✅ No sync loops or flickering
- ✅ Professional UX (feels like Editor.md or StackEdit)
- ✅ Markdown round-trip fidelity (MD → HTML → MD identical)
- ✅ All tests passing
- ✅ No console errors or warnings

### Production Ready When:
- ✅ Phase 1 complete
- ✅ File operations implemented (open, save, auto-save)
- ✅ Image handling implemented
- ✅ Export features working (HTML, PDF)
- ✅ Error handling comprehensive
- ✅ Accessibility tested (keyboard navigation, screen readers)
- ✅ Cross-browser tested (Chrome, Firefox, Safari, Edge)
- ✅ Mobile responsive (works on tablets)
- ✅ Performance optimized (lighthouse score >90)
- ✅ Documentation complete

---

## Debugging Tips

### 1. Enable Debug Logging
```typescript
// Add to sync engine
console.log('[SYNC]', {
  direction: 'source→visual',
  activeEditor,
  isSyncing,
  markdownLength: markdown.length
});
```

### 2. Monitor State Changes
- Install Zustand DevTools extension
- Watch state changes in real-time
- Time-travel debugging

### 3. Check Performance
```typescript
// Log slow operations
const start = performance.now();
// ... operation ...
const duration = performance.now() - start;
if (duration > 100) console.warn('Slow operation:', duration, 'ms');
```

### 4. Inspect Sync Issues
- Set breakpoints in sync engine
- Check `activeEditor` value
- Verify `isSyncing` flag
- Look for unexpected re-renders

### 5. Test Edge Cases
```typescript
// Test with problematic content
const testContent = `
# Test
**bold *nested italic* bold**
~~strikethrough~~
\`\`\`javascript
const code = "test";
\`\`\`
| Table | Test |
|-------|------|
| Cell  | Data |
`;
```

---

## Next Steps After Phase 1

Once Phase 1 is solid and tested:

1. **Implement file operations** - Save/load from disk
2. **Add image handling** - Drag-drop, paste, upload
3. **Build export features** - HTML, PDF, clipboard
4. **Add preferences UI** - Theme, font size, keybindings
5. **Optimize performance** - Virtual scrolling, Web Workers
6. **Consider Tauri wrapper** - Package as native Mac app

---

## Resources & References

### Documentation
- [TipTap Docs](https://tiptap.dev/)
- [CodeMirror 6 Docs](https://codemirror.net/docs/)
- [Zustand Docs](https://docs.pmnd.rs/zustand)
- [markdown-it Docs](https://markdown-it.github.io/)
- [turndown Docs](https://github.com/mixmark-io/turndown)

### Inspiration
- [Editor.md](https://pandao.github.io/editor.md/)
- [StackEdit](https://stackedit.io/)
- [HackMD](https://hackmd.io/)
- [Typora](https://typora.io/)

### Tools
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)
- [Vitest](https://vitest.dev/)

