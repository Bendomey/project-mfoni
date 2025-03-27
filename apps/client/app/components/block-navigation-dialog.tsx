import { ExclamationTriangleIcon } from "@heroicons/react/24/solid";
import { type Blocker } from "@remix-run/react";
import { Button } from "@/components/button/index.tsx";
import { Modal } from "@/components/modal/index.tsx";

interface Props {
  blocker: Blocker;
}

export function BlockNavigationDialog({ blocker }: Props) {
  return (
    <Modal
      onClose={() => {}}
      canBeClosedWithBackdrop={false}
      className="w-full md:w-1/2 lg:w-1/3"
      isOpened={blocker.state === "blocked"}
    >
      <div className="flex flex-col items-center justify-center">
        <div className="rounded-full bg-yellow-50 p-3">
          <ExclamationTriangleIcon className="h-12 w-12 text-yellow-500" />
        </div>
        <h1 className="mt-5 text-center text-xl font-bold">
          You have unsaved changes.
        </h1>

        <p className="mt-1 text-center text-sm text-gray-600">
          Are you sure you want to leave?
        </p>

        <div className="mt-5 flex items-center gap-3">
          <Button onClick={() => blocker.proceed?.()}>Proceed</Button>
          <Button color="secondaryGhost" onClick={() => blocker.reset?.()}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
}
