import { useFetcher, useLocation } from "@remix-run/react";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { QUERY_KEYS } from "@/constants/index.ts";
import { errorToast } from "@/lib/custom-toast-functions.tsx";
import { useAuth } from "@/providers/auth/index.tsx";

interface Props {
  content: Content;
  children: (props: {
    isLiked: boolean;
    isDisabled: boolean;
    onClick: VoidFunction;
  }) => React.ReactNode;
}

export function LikeButton({ content, children }: Props) {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  const location = useLocation();
  const fetcher = useFetcher<{ error: string }>();
  const [isLiked, setIsLiked] = useState(Boolean(content.currentUserLike));

  // where there is an error in the action data, show an error toast
  useEffect(() => {
    if (fetcher?.data?.error) {
      errorToast(fetcher?.data.error, {
        id: "error-content-like",
      });
      setIsLiked((prev) => !prev);
    }
  }, [fetcher?.data]);

  const handleSubmit = () => {
    fetcher.submit(
      {
        contentId: content.id,
        type: isLiked ? "UNLIKE" : "LIKE",
      },
      {
        action: `/api/like-content?from=${location.pathname}`,
        encType: "multipart/form-data",
        method: "post",
        preventScrollReset: true,
      },
    );
    setIsLiked((prev) => !prev);

    if (currentUser) {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.CONTENT_LIKES, "user", currentUser.id],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.COLLECTIONS],
      });
    }
  };

  const isDisabled = fetcher.state === "submitting";

  return children({ isLiked, isDisabled, onClick: handleSubmit });
}
