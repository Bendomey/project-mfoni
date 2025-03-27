import {
  useBeforeUnload,
  useBlocker as useRemixBlocker,
} from "@remix-run/react";
import { useCallback } from "react";

export function useBlocker(isDirty: boolean) {
  const blocker = useRemixBlocker(
    ({ currentLocation, nextLocation }) =>
      isDirty && currentLocation.pathname !== nextLocation.pathname,
  );

  const handleBeforeUnload = useCallback(
    (event: BeforeUnloadEvent) => {
      if (isDirty) {
        event.preventDefault();

        /**
         * Note: `returnValue` is a legacy feature, and best practice is to trigger the dialog
         * by invoking Event.preventDefault() on the BeforeUnloadEvent object,
         * while also setting `returnValue` to support legacy cases. See the beforeunload event
         * reference for detailed up-to-date guidance.
         */
        event.returnValue =
          "You have unsaved changes. Are you sure you want to leave?";
      }
    },
    [isDirty],
  );

  useBeforeUnload(handleBeforeUnload);

  return blocker;
}
