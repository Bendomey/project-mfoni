/**
 * Converts megabytes to bytes
 *
 * @param megabytes {number}
 * @returns bytes {number}
 */
export const megabytesToBytes = (megabytes: number) => megabytes * 1024 * 1024
export const bytesToMegabytes = (bytes: number) => bytes / 1024 / 1024

export const getSizeStringForContent = (size: number) => {
	if (size < 1024) {
		return `${size} B`
	} else if (bytesToMegabytes(size) < 1) {
		return `${(size / 1024).toFixed(2)} KB`
	} else {
		return `${bytesToMegabytes(size).toFixed(2)} MB`
	}
}

interface ValidateImageDimensionsProps {
	/** Size to validate image res. */
	size: number
	/** Image url to validate. */
	imageUrl: string
}

/**
 * Validates image dimensions.
 *
 * @throws {Error} - When image does not match the dimensions required.
 * @returns {Promise<object>} - The image object.
 */
export function validateImageDimensions({
	size,
	imageUrl,
}: ValidateImageDimensionsProps) {
	return new Promise((accept, reject) => {
		const img = new Image()

		img.onload = () => {
			// Check if image is bad/invalid
			if (img.width + img.height === 0) {
				return reject(
					new Error(`This is a bad/invalid image. Please try again.`),
				)
			}
			// Check the image resolution
			if (img.width >= size && img.height >= size) {
				/* empty */
			} else {
				return reject(
					new Error(
						`Uploads must be at least 4 megapixels in size. This photo will not be published.`,
					),
				)
			}

			return accept(true)
		}
		img.src = imageUrl
	})
}

/**
 * Retrieves the orientation of an image. LANDSCAPE, PORTRAIT, or SQUARE.
 *
 * @returns {Promise<string>} - The orientation of the image.
 */
export function getImageOrientation(file: File): Promise<IContentOrientation> {
	return new Promise((accept) => {
		const img = new Image()

		img.onload = () => {
			if (img.width > img.height) {
				return accept('LANDSCAPE')
			} else if (img.width < img.height) {
				return accept('PORTRAIT')
			} else {
				return accept('SQUARE')
			}
		}
		img.src = URL.createObjectURL(file)
	})
}

export interface PaletteItem {
	color: string
	count: number
}

interface Opts {
	scale?: number
}

const defaultOpts: Required<Opts> = {
	scale: 1,
}

const getContext = (
	width: number,
	height: number,
): CanvasRenderingContext2D | null => {
	const canvas: HTMLCanvasElement = document.createElement('canvas')
	canvas.width = width
	canvas.height = height
	return canvas.getContext('2d')
}

const getImageData = (
	imageURL: string,
	options: Required<Opts>,
): Promise<Uint8ClampedArray> => {
	const { scale } = options
	const image: HTMLImageElement = new Image()
	image.crossOrigin = '*'

	return new Promise((resolve, reject) => {
		const errorHandler = () =>
			reject(new Error('An error occurred loading the image.'))

		image.onload = function () {
			const width = image.width * scale
			const height = image.height * scale
			const context = getContext(width, height)

			if (context) {
				context.drawImage(image, 0, 0, width, height)

				const { data } = context.getImageData(0, 0, width, height)
				resolve(data)
			} else {
				errorHandler()
			}
		}

		image.onerror = errorHandler
		image.onabort = errorHandler
		image.src = imageURL
	})
}

const getCounts = (data: Uint8ClampedArray) => {
	const countMap = new Map<string, number>()

	for (let i = 0; i < data.length; i += 4) {
		const alpha = data[i + 3]

		if (alpha === 0) {
			continue // Skip transparent pixels
		}

		const rgb: Array<number> = Array.from(data.subarray(i, i + 3))
		const allEqual = rgb.every((v) => v === rgb[0])
		if (rgb.length >= 3) {
			const hexColor = rgbToHex(rgb[0]!, rgb[1]!, rgb[2]!)
			countMap.set(hexColor, allEqual ? 0 : (countMap.get(hexColor) ?? 0) + 1)
		}
	}

	const counts = Array.from(countMap, ([color, count]) => ({ color, count }))
	return counts.sort((a, b) => b.count - a.count)
}

/**
 * Analyzes an image and returns an array of colors in the image sorted by usage count.
 *
 * @param imageURL - The URL of the image to analyze.
 * @param [options] - An object containing options. The only option currently supported is `scale`. It defaults to 1.
 *
 * @returns An array of colors sorted by usage count.
 *
 * @example
 * import { palettize } from '@/lib/image-fns';
 *
 * palletize('https://example.com/some.jpg', {})
 *   .then(colors => {
 *     setMostUsedColor(colors[0].color);
 *   )
 *
 * palletize('https://example.com/some.jpg', { scale: 2 })
 *   .then(colors => {
 *     setMostUsedColor(colors[0].color);
 *   )
 */

export const palettize = async (imageURL: string, opts?: Opts) => {
	const options: Required<Opts> = { ...defaultOpts, ...opts }
	const data = await getImageData(imageURL, options)

	return getCounts(data)
}

function rgbToHex(r: number, g: number, b: number) {
	return `#${((1 << 24) | (r << 16) | (g << 8) | b)
		.toString(16)
		.slice(1)
		.toUpperCase()}`
}
