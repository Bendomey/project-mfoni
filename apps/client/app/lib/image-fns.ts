/**
 * Converts megabytes to bytes
 *
 * @param megabytes {number}
 * @returns bytes {number}
 */
export const megabytesToBytes = (megabytes: number) => megabytes * 1024 * 1024

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
