import { useEffect } from 'react'

/**
 * This hook locks the scrolling of the body element. Generally used in dialogs and modals.
 *
 * @example
 * ```tsx
 * import { useLockBodyScroll } from '@/hooks/use-lock-body-scroll.tsx'
 *
 * function MyComponent() {
 *
 *   useLockBodyScroll();
 *
 *   return (
 *     <>
 *       ...
 *     </>
 *   )
 * }
 * ```
 */
export function useLockBodyScroll({
	enabled = true,
}: {
	enabled?: boolean
}): void {
	useEffect((): (() => void) => {
		const originalStyle: string = window.getComputedStyle(
			document.body,
		).overflow
		if (enabled) {
			document.body.style.overflow = 'hidden'
		}
		return () => (document.body.style.overflow = originalStyle)
	}, [enabled])
}
