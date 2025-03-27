export const dataURLtoFile = async (dataUrl: string, filename: string) => {
  dataUrl = await convertWebPtoJPEG(dataUrl);
  const arr = dataUrl.split(",");

  if (arr.length < 2) {
    throw new Error("Invalid data url");
  }

  let mime = arr[0]!.match(/:(.*?);/)![1],
    bstr = atob(arr[1]!),
    n = bstr.length,
    u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  const extension = mime?.split("/")[1] ?? "jpg";
  return new File([u8arr], `${filename}.${extension}`, { type: mime });
};

const convertWebPtoJPEG = async (webpDataUrl: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = webpDataUrl;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0);
      }

      const jpegDataUrl = canvas.toDataURL("image/jpeg");
      resolve(jpegDataUrl);
    };
  });
};
