// Image.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react'
import { validateImage } from '@/hooks/use-validate-image.tsx'
import { classNames } from '@/lib/classNames.ts'

type ImageStatus = 'loading' | 'loaded' | 'error'

interface ImageProps
	extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'children'> {
	src: string
	alt: string
	width?: number | string
	height?: number | string
	className?: string
	loadingColor?: string | null
	blurDataURL?: string
	intersectionObserverThreshold?: number
	intersectionObserverRootMargin?: string
	onLoad?: () => void
	onError?: () => void
	onInView?: () => void
	renderLoading?: (props: {
		className?: string
		style?: React.CSSProperties
	}) => React.ReactNode
	renderError?: (props: {
		className?: string
		style?: React.CSSProperties
		retry: () => void
	}) => React.ReactNode
	children?: (
		status: ImageStatus,
		imgProps: {
			src: string
			alt: string
			className?: string
		},
	) => React.ReactNode
}

/**
 * A headless image component that lazy loads images when they come into view.
 * It also provides a loading state and error state with a retry button.
 *
 * @param src - The image URL to load.
 * @param alt - The alt text for the image.
 * @param width - The width of the image.
 * @param height - The height of the image.
 * @param className - The class name to apply to the image container.
 * @param loadingColor - The background color to display while the image is loading.
 * @param blurDataURL - The base64 encoded image to display as a placeholder while the image is loading.
 * @param intersectionObserverThreshold - The threshold at which to trigger the image load.
 * @param intersectionObserverRootMargin - The margin around the root to trigger the image load.
 * @param onLoad - A callback to run when the image has loaded.
 * @param onError - A callback to run when the image has errored.
 * @param onInView - A callback to run when the image comes into view.
 * @param renderLoading - A custom loading state to render.
 * @param renderError - A custom error state to render.
 * @param children - A render prop function to render the image.
 *
 * @returns A headless image component.
 *
 *
 * @example Basic Usage
 *
 * <Image
 *  src="/path/to/image.jpg"
 *   alt="Description"
 *  width={300}
 *  height={200}
 *  loadingColor="#e5e7eb"
 * />
 *
 * @example With Custom Loading and Error States
 *
 * <Image
 *  src="/path/to/image.jpg"
 *  alt="Description"
 *  width={300}
 *  height={200}
 *  loadingColor="#e5e7eb"
 *  renderLoading={({ style }) => (
 *      <div style={style} className="animate-pulse rounded">
 *          <span>Loading...</span>
 *      </div>
 *  )}
 *  renderError={({ retry }) => (
 *      <button onClick={retry} className="bg-red-100 p-4">
 *          Something went wrong. Try again
 *      </button>
 *  )}
 * />
 *
 * @example Using the Render Props Pattern
 *
 * <Image
 *  src="/path/to/image.jpg"
 *  alt="Description"
 *  width={300}
 *  height={200}
 *  loadingColor="#e5e7eb"
 * >
 *  {(status, imgProps) => (
 *     <>
 *      {status === 'loading' && <div>Loading...</div>}
 *      {status === 'error' && <div>Error...</div>}
 *      {status === 'loaded' && <img {...imgProps} />}
 *    </>
 *  )}
 * </Image>
 *
 */

export const Image: React.FC<ImageProps> = ({
	src,
	alt,
	width,
	height,
	className = '',
	loadingColor, // Default light gray
	blurDataURL,
	intersectionObserverThreshold = 0.1,
	intersectionObserverRootMargin = '200px 0px',
	onLoad,
	onError,
	onInView,
	renderLoading,
	renderError,
	children,
	...imageProps
}) => {
	loadingColor = loadingColor || '#f3f4f6'
	const [status, setStatus] = useState<ImageStatus>('loading')
	const [, setIsInView] = useState(false)
	const [imgSrc, setImgSrc] = useState<string | null>(null)
	const imgRef = useRef<HTMLImageElement>(null)
	const containerRef = useRef<HTMLDivElement>(null)

	// Handle image loading and errors
	const handleLoad = useCallback(() => {
		setStatus('loaded')
		onLoad?.()
	}, [onLoad])

	const handleError = useCallback(() => {
		setStatus('error')
		onError?.()
	}, [onError])

	// Load image when in viewport
	useEffect(() => {
		if (!containerRef.current) return

		const observer = new IntersectionObserver(
			async (entries) => {
				const [entry] = entries
				if (!entry) return

				setIsInView(entry.isIntersecting)

				if (entry.isIntersecting) {
					try {
						await validateImage(src)
						setImgSrc(src)
						onInView?.()
					} catch {
						handleError()
						return
					}

					// Disconnect once we've seen it
					observer.disconnect()
				}
			},
			{
				root: null,
				rootMargin: intersectionObserverRootMargin,
				threshold: intersectionObserverThreshold,
			},
		)

		observer.observe(containerRef.current)

		return () => {
			observer.disconnect()
		}
	}, [
		src,
		onInView,
		intersectionObserverRootMargin,
		intersectionObserverThreshold,
		handleError,
	])

	const retry = () => {
		setStatus('loading')
		// Force re-fetch by appending a cache buster
		const timestamp = new Date().getTime()
		setImgSrc(`${src}${src.includes('?') ? '&' : '?'}_retry=${timestamp}`)
	}

	// Default loading state
	const defaultLoading = (
		<div
			className={classNames('animate-pulse', className)}
			style={{
				width,
				height,
				backgroundColor: loadingColor,
				backgroundImage: blurDataURL ? `url(${blurDataURL})` : undefined,
				backgroundSize: 'cover',
				backgroundPosition: 'center',
			}}
			aria-live="polite"
			role="status"
		/>
	)

	// Default error state
	const defaultError = (
		<div
			className={className}
			style={{
				width,
				height,
				backgroundColor: '#fee2e2',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				cursor: 'pointer',
			}}
			onClick={retry}
			tabIndex={0}
			role="button"
			aria-live="assertive"
		>
			<span style={{ color: '#b91c1c' }}>
				Failed to load image. Click to retry.
			</span>
		</div>
	)

	// Render children function if provided
	if (children) {
		return (
			<div ref={containerRef} style={{ width, height }}>
				{children(status, {
					src: imgSrc || '',
					alt,
					className,
				})}
			</div>
		)
	}

	// Default rendering behavior
	return (
		<div ref={containerRef} style={{ width, height }}>
			{status === 'loading' &&
				(renderLoading
					? renderLoading({
							className,
							style: {
								width,
								height,
								backgroundColor: loadingColor,
								backgroundImage: blurDataURL
									? `url(${blurDataURL})`
									: undefined,
								backgroundSize: 'cover',
								backgroundPosition: 'center',
							},
						})
					: defaultLoading)}

			{status === 'error' &&
				(renderError
					? renderError({
							className,
							style: { width, height },
							retry,
						})
					: defaultError)}

			{imgSrc && (
				<img
					ref={imgRef}
					src={imgSrc}
					alt={alt}
					width={width}
					height={height}
					className={`${className} ${status === 'loaded' ? 'block' : 'hidden'}`}
					onLoad={handleLoad}
					onError={handleError}
					{...imageProps}
				/>
			)}
		</div>
	)
}
