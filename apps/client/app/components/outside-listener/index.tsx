import { type PropsWithChildren, useRef, useEffect, useCallback } from 'react'

/**
 * Hook that alerts clicks outside of the passed ref
 */
function useOutsideListener(ref: any, onClick: VoidFunction) {
	/**
	 * Alert if clicked on outside of element
	 */
	const handleClickOutside = useCallback(
		(event: any) => {
			if (ref.current && !ref.current.contains(event.target)) {
				onClick()
			}
		},
		[onClick, ref],
	)

	useEffect(() => {
		// Bind the event listener
		document.addEventListener('mousedown', handleClickOutside)
		return () => {
			// Unbind the event listener on clean up
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [handleClickOutside])
}

/**
 * Component that alerts if you click outside of it
 */
export default function OutsideListener({
	onClick,
	children,
}: PropsWithChildren<{ onClick: VoidFunction }>) {
	const wrapperRef = useRef(null)

	useOutsideListener(wrapperRef, onClick)

	return <div ref={wrapperRef}>{children}</div>
}
