import { useMutation } from "@tanstack/react-query";

interface IGenerateSignedUrlInput {
  filename: string;
  contentType: string;
  abortController: AbortController;
}

interface IGenerateSignedUrlOutput {
  fileLink: string;
  signedUrl: string;
  key: string;
}

export const generateSignedUrl = async (props: IGenerateSignedUrlInput) => {
  const res = await fetch("/api/s3", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      filename: props.filename,
      contentType: props.contentType,
    }),
    signal: props.abortController.signal,
  });
  const data = await res.json();
  return data as IGenerateSignedUrlOutput;
};

export const useSignS3UploadUrl = () =>
  useMutation({
    mutationFn: generateSignedUrl,
  });

interface IGenerateDownloadSignedUrlInput {
  key: string;
}

export const generateDownloadSignedUrl = async (
  props: IGenerateDownloadSignedUrlInput,
  origin: string,
) => {
  const res = await fetch(`${origin}/api/s3/download`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      key: props.key,
    }),
  });
  const data = await res.json();
  return data as IGenerateSignedUrlOutput;
};
