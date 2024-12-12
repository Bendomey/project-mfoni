import { useEffect, useState } from 'react'

type UseDebounceParams<T> = {
	/** An optional function that runs when setting the debounced value. */
	callback?: (value: T) => void
	/** Number of milliseconds to wait to return the debounced value. */
	delay: number
	/** The value to debounce. */
	value: T
}

/**
 * Takes an input and delays the return.
 * Primarily used to wait for user input to finish before performing an action.
 *
 * @example
 * ```tsx
 * import { useState } from 'react';
 * import { useDebounce } from '@/hooks';
 *
 * function MyComponent() {
 *   const [name, setName] = useState('');
 *
 *   const debouncedName = useDebounce({
 *     value: name,
 *     delay: 250,
 *     callback: (name) => alert(name),
 *   });
 *
 *   return (
 *     <>
 *       <input value={name} onChange((event) => setName(event.target.value)) />
 *       Updated name: {debouncedName}
 *     </>
 *   )
 * }
 * ```
 */
export function useDebounce<T>({
	value,
	delay,
	callback,
}: UseDebounceParams<T>): T {
	const [debouncedValue, setDebouncedValue] = useState<T>(value)
	useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedValue(value)
			if (callback) {
				callback(value)
			}
		}, delay)
		return () => {
			clearTimeout(handler)
		}
	}, [value, delay, callback])
	return debouncedValue
}

/**
 * Similar to React.useState, but with built in debounce functionality.
 *
 * @example
 * ```tsx
 * import { useDebouncedState } from '@/hooks';
 *
 * function MyComponent() {
 *   const [name, setName, debouncedName] = useDebouncedState(
 *     '',
 *     {
 *       delay: 250,
 *       callback: (name) => alert(name),
 *     }
 *   );
 *
 *   return (
 *     <>
 *       <input value={name} onChange((event) => setName(event.target.value)) />
 *       Updated name: {debouncedName}
 *     </>
 *   )
 * }
 * ```
 */
export function useDebouncedState<S>(
	initialValue: S,
	{ delay, callback }: Pick<UseDebounceParams<S>, 'delay' | 'callback'>,
): [S, React.Dispatch<React.SetStateAction<S>>, S] {
	const [state, setState] = useState<S>(initialValue)
	const debouncedState = useDebounce<S>({ callback, delay, value: state })
	return [state, setState, debouncedState]
}
