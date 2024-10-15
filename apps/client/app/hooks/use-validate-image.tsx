import { useState } from 'react';

export const useValidateImage = (imageUrl: string) => {
  const [imageIsValid, setImageIsValid] = useState(false);

  const img = new Image();

  img.src = imageUrl;
  img.onload = () => {
    setImageIsValid(true);
  };

  return imageIsValid;
};
