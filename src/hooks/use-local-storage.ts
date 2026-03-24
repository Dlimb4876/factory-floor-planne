import { useState, useCallback } from 'react'

/**
 * A hook that works similarly to React.useState, but persists the value to
 * localStorage. This is a drop-in replacement for the @github/spark useKV hook
 * when running outside the GitHub Spark environment (e.g., on GitHub Pages).
 */
export function useLocalStorage<T>(
  key: string,
  initialValue?: T
): readonly [T | undefined, (newValue: T | ((oldValue?: T) => T)) => void, () => void] {
  const [value, setValue] = useState<T | undefined>(() => {
    try {
      const stored = localStorage.getItem(key)
      if (stored !== null) {
        return JSON.parse(stored) as T
      }
    } catch {
      console.warn(`Failed to parse localStorage value for key: ${key}`)
    }
    return initialValue
  })

  const setStoredValue = useCallback(
    (newValue: T | ((oldValue?: T) => T)) => {
      setValue(prev => {
        const resolved =
          typeof newValue === 'function'
            ? (newValue as (oldValue?: T) => T)(prev)
            : newValue
        try {
          localStorage.setItem(key, JSON.stringify(resolved))
        } catch {
          console.warn(`Failed to save to localStorage for key: ${key}`)
        }
        return resolved
      })
    },
    [key]
  )

  const deleteValue = useCallback(() => {
    try {
      localStorage.removeItem(key)
    } catch {
      // ignore
    }
    setValue(undefined)
  }, [key])

  return [value, setStoredValue, deleteValue] as const
}
