import { useCallback, useRef } from 'react'

/**
 * Returns a debounced version of the callback that delays invocation
 * until after wait ms have elapsed since the last call.
 */
export function useDebounce<T extends (...args: unknown[]) => void>(
  callback: T,
  wait: number
): T {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const callbackRef = useRef(callback)

  callbackRef.current = callback

  const debounced = useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = null
        callbackRef.current(...args)
      }, wait)
    }) as T,
    [wait]
  )

  return debounced
}
