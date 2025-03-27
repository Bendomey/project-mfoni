import { Transition, Dialog } from "@headlessui/react";
import { Fragment, type PropsWithChildren } from "react";
import { useLockBodyScroll } from "@/hooks/use-lock-body-scroll.tsx";
import { classNames } from "@/lib/classNames.ts";

interface Props {
  isOpened: boolean;
  onClose: () => void;
  canBeClosedWithBackdrop?: boolean;
  className?: string;
}

export const Modal = ({
  onClose,
  isOpened,
  children,
  canBeClosedWithBackdrop = true,
  className,
}: PropsWithChildren<Props>) => {
  useLockBodyScroll({ enabled: isOpened });

  return (
    <Transition appear show={isOpened} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={canBeClosedWithBackdrop ? onClose : () => {}}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel
                className={classNames(
                  "relative w-full transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all",
                  className,
                )}
              >
                {children}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
