import { useState, useEffect } from 'react'

export const useEventCallback = <T extends (...args: any[]) => any>(
	callback: T,
) => {
	const [handler, setHandler] = useState<T>(() => {
		return ((...args: any[]) => {
			return callback(...args)
		}) as T
	})

	useEffect(() => {
		setHandler(() => {
			return ((...args: any[]) => {
				return callback(...args)
			}) as T
		})
	}, [callback])

	return handler
}
