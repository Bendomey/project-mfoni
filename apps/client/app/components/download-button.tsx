import { useFetcher } from "@remix-run/react";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { QUERY_KEYS } from "@/constants/index.ts";
import { errorToast } from "@/lib/custom-toast-functions.tsx";

export type ContentSize = "SMALL" | "MEDIUM" | "LARGE" | "ORIGINAL";

interface Props {
  content: Content;
  children: (props: {
    isDisabled: boolean;
    onClick: (size: ContentSize) => void;
  }) => React.ReactNode;
}

export function DownloadButtonApi({ children, content }: Props) {
  const [isInitiatingDownload, setInitiatingDownload] = useState(false);
  const queryClient = useQueryClient();
  const fetcher = useFetcher<{
    error?: string;
    signedUrl?: string;
    size?: string;
  }>();

  // where there is an error in the action data, show an error toast
  useEffect(() => {
    if (fetcher.state === "idle" && fetcher?.data?.error) {
      setInitiatingDownload(false);
      errorToast(fetcher?.data.error, {
        id: "error-downloading-content",
      });
    }
  }, [fetcher?.data, fetcher.state]);

  const initiateDownload = useCallback(
    async (signedUrl: string) => {
      const fileResponse = await fetch(signedUrl);
      const blob = await fileResponse.blob();

      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.setAttribute(
        "download",
        `${content.title.replace(/ /g, "_")}_${fetcher.data
          ?.size}`.toLowerCase(),
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(link.href);
      setInitiatingDownload(false);
    },
    [content.title, fetcher.data?.size],
  );

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data?.signedUrl) {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.CONTENTS, content.slug],
      });

      initiateDownload(fetcher.data.signedUrl);
    }
  }, [
    content.slug,
    content.title,
    fetcher.data,
    fetcher.state,
    initiateDownload,
    queryClient,
  ]);

  const handleSubmit = (size: ContentSize) => {
    setInitiatingDownload(true);
    fetcher.submit(
      {
        contentId: content.id,
        size,
      },
      {
        action: `/api/download-content`,
        encType: "multipart/form-data",
        method: "post",
        preventScrollReset: true,
      },
    );
  };

  const isDisabled = fetcher.state === "submitting" || isInitiatingDownload;
  return children({ isDisabled, onClick: handleSubmit });
}
