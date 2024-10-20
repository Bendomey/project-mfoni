import { useEffect, useState } from 'react';

export const useValidateImage = (imageUrl: string) => {
  const [imageIsValid, setImageIsValid] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const img = new Image();

      img.src = imageUrl;
      img.onload = () => {
        setImageIsValid(true);
      };

    }
  }, [imageUrl])


  return imageIsValid;
};
