import { useEffect, useState } from 'react'



/**
 * This method validates a File (input) or an image URL
 * @param src - The image to validate, an input File or a local or remote image url
 * @param config - an optional config object that defines the method behaviour
 * @returns - Returns true for valid images, throws or returns false for invalid images
 */
export const validateImage = (
  src: string | File,
  config?: {
    throw: boolean;
  }
): Promise<boolean | undefined> => {
  if (typeof window === "undefined") {
    throw new Error(
      "Cannot use this utility method in a non browser environment"
    );
  }

  let url = "";
  if (typeof src === "string") {
    url = src;
  } else {
    url = URL.createObjectURL(src);
  }

  const image = new Image();
  image.src = url;

  return new Promise((resolve, reject) => {
    image.addEventListener("error", () =>
      config?.throw
        ? reject("The media resource is either invalid, corrupt or unsuitable")
        : resolve(false)
    );

    image.addEventListener("load", () => resolve(true), false);
  });
};

export const useValidateImage = (imageUrl: string) => {
  const [imageIsValid, setImageIsValid] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      void (async () => {
        try {
          const res = await validateImage(imageUrl)
          if (res) {
            setImageIsValid(res)
          }
        } catch (error: unknown) {
          setImageIsValid(false)
        }
      })()
    }
  }, [imageUrl])

  return (imageIsValid)
}