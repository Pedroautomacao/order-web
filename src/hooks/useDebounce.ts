import { useState, useEffect, useCallback } from 'react'

/**
 * Returns a debounced value that updates after `delay` ms of no changes.
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}

/**
 * Returns [inputValue, setInputValue, debouncedValue] for use with search fields.
 */
export function useDebouncedSearch(initialValue = '', delay = 300): [string, (v: string) => void, string] {
  const [inputValue, setInputValue] = useState(initialValue)
  const debouncedValue = useDebounce(inputValue, delay)
  return [inputValue, setInputValue, debouncedValue]
}
