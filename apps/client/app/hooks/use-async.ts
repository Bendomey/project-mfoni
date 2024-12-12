import React from 'react'
import { useIsMounted } from './use-is-mounted.ts'

type IUseAsync = (
	/**
	 * Async function used to keep track of its current state.
	 */
	asyncFunction: (params?: any) => Promise<any>,
	/**
	 * Runs the async function immediately if true, otherwise refer to the `execute` function returned from this hook to be executed at the time of your choosing.
	 */
	immediate: boolean,
) => {
	error: {
		message: string
	} | null
	execute: (params?: any) => void
	idle: boolean
	pending: boolean
	value: any
}

/**
 * Rather then litter your components with a bunch of useState calls to keep track of the state of
 * an async function, you can use our custom hook which takes an async function as an input and
 * returns the pending, value, and error values we need to properly update our UI. As you'll see
 * in the code below, our hook allows both immediate execution and delayed execution using the
 * returned execute function. (source: https://usehooks.com/useAsync/).
 *
 * _Adapted to have an idle state_.
 */
export const useAsync: IUseAsync = (asyncFunction, immediate = true) => {
	const isMounted = useIsMounted()
	const [idle, setIdle] = React.useState(true)
	const [pending, setPending] = React.useState(false)
	const [value, setValue] = React.useState(null)
	const [error, setError] = React.useState(null)

	// The execute function wraps asyncFunction and
	// handles setting state for pending, value, and error.
	// useCallback ensures the below useEffect is not called
	// on every render, but only if asyncFunction changes.
	const execute = React.useCallback(
		(params?: any) => {
			setIdle(false)
			setPending(true)
			setValue(null)
			setError(null)
			return asyncFunction(params)
				.then((response) => {
					if (response === undefined) {
						throw new Error('Async function returned undefined')
					}
					if (isMounted()) {
						setValue(response)
						setPending(false)
					}
				})
				.catch((e) => {
					if (isMounted()) {
						setError(e)
						setPending(false)
					}
				})
		},
		[asyncFunction, isMounted],
	)

	// Call execute if we want to fire it right away.
	// Otherwise execute can be called later, such as
	// in an onClick handler.
	React.useEffect(() => {
		if (immediate) {
			void execute()
		}
	}, [execute, immediate, isMounted])

	return {
		error,
		execute,
		idle,
		pending,
		value,
	}
}
