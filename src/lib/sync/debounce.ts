/**
 * Debounce with cancellation: when invoked again before the delay,
 * the previous timeout is cleared and a new one is scheduled.
 */
export function debounceWithCancel<T extends () => void>(
  fn: T,
  delayMs: number
): { run: () => void; cancel: () => void } {
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  return {
    run: () => {
      if (timeoutId !== null) clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        timeoutId = null
        fn()
      }, delayMs)
    },
    cancel: () => {
      if (timeoutId !== null) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
    },
  }
}
