'use client'

import { useState, useEffect } from 'react'

export function usePersistentState<T>(
    key: string,
    initialValue: T
): [T, (value: T | ((prevValue: T) => T)) => void] {
    // Initialize with either the value from localStorage or the provided initialValue
    const [state, setState] = useState<T>(() => {
        // Only run in client-side
        if (typeof window === 'undefined') {
            return initialValue
        }

        try {
            const item = window.localStorage.getItem(key)
            return item ? JSON.parse(item) : initialValue
        } catch (error) {
            console.error('Error reading from localStorage:', error)
            return initialValue
        }
    })

    // Update localStorage when state changes
    useEffect(() => {
        if (typeof window === 'undefined') {
            return
        }

        try {
            if (state === null) {
                window.localStorage.removeItem(key)
            } else {
                window.localStorage.setItem(key, JSON.stringify(state))
            }
        } catch (error) {
            console.error('Error writing to localStorage:', error)
        }
    }, [key, state])

    return [state, setState]
}
