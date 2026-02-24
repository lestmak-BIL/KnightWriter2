# Regression tests

Add tests here for every bug fix to prevent regressions.

## When to add regression tests

Every time you fix a bug:

1. Create a new test file: `tests/regression/bug-{issue-number}.test.ts` (or a short descriptive name).
2. Add a test that **reproduces the original bug** (so it would fail without your fix).
3. Verify the test **fails without your fix** (e.g. temporarily revert the fix).
4. Verify the test **passes with your fix**.
5. Link the test to the GitHub issue or commit in a comment.

## Example

```typescript
// tests/regression/bug-127-infinite-loop.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

/**
 * Bug #127: Infinite loop when switching editors rapidly.
 * Fixed in commit abc123.
 */
describe('Bug #127: Infinite loop on rapid switching', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('does not hang when switching 50 times', async () => {
    // Test case that previously caused hang
    // Assert it completes in reasonable time / no infinite loop
  })
})
```

## Running regression tests

From project root:

```bash
npm test -- tests/regression
# or
npm run test:run -- tests/regression
```

Regression tests are part of the full suite; they run with `npm run test:run` and in CI.
