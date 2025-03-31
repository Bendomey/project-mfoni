import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { type PropsWithChildren } from "react";
import { useLockBodyScroll } from "@/hooks/use-lock-body-scroll.tsx";
import { classNames } from "@/lib/classNames.ts";

interface Props {
  isOpened: boolean;
  onClose: () => void;
  canBeClosedWithBackdrop?: boolean;
  className?: string;
}

export const Drawer = ({
  onClose,
  isOpened,
  children,
  canBeClosedWithBackdrop = true,
  className,
}: PropsWithChildren<Props>) => {
  useLockBodyScroll({ enabled: isOpened });

  return (
    <Dialog
      open={isOpened}
      className="relative z-50"
      onClose={canBeClosedWithBackdrop ? onClose : () => {}}
    >
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-500 ease-in-out data-[closed]:opacity-0"
      />

      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
            <DialogPanel
              transition
              className={classNames(
                "pointer-events-auto w-screen max-w-md transform transition duration-500 ease-in-out data-[closed]:translate-x-full sm:duration-700",
                className,
              )}
            >
              {children}
            </DialogPanel>
          </div>
        </div>
      </div>
    </Dialog>
  );
};
