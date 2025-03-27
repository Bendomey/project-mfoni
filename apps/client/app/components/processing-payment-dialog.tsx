import { Dialog } from "@headlessui/react";
import { useEffect } from "react";
import { LoadingLottie } from "./lotties/loading.tsx";
import { Modal } from "./modal/index.tsx";

interface Props {
  onClose: () => void;
  isOpened: boolean;
}

export function ProcessingPaymentDialog({ isOpened, onClose }: Props) {
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isOpened) {
      interval = setTimeout(() => {
        onClose();
        window.location.reload();
      }, 5000);
    }

    return () => {
      clearTimeout(interval);
    };
  }, [isOpened, onClose]);

  return (
    <Modal
      canBeClosedWithBackdrop={false}
      className="w-full sm:w-1/2 md:w-1/3"
      isOpened={isOpened}
      onClose={onClose}
    >
      <div className="flex h-[25vh] flex-col items-center justify-between">
        <div>
          <Dialog.Title
            as="h3"
            className="text-center font-bold leading-6 text-gray-900"
          >
            Processing Payment
          </Dialog.Title>
          <span className="text-center text-sm text-gray-600">
            Please wait while we process your payment.
          </span>
        </div>

        <div className="flex flex-row items-center space-x-2">
          <LoadingLottie />
        </div>
      </div>
    </Modal>
  );
}
