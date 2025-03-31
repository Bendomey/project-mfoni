import { useState } from "react";
import { Button } from "@/components/button/index.tsx";
import { Modal } from "@/components/modal/index.tsx";
import { errorToast } from "@/lib/custom-toast-functions.tsx";
import { convertPesewasToCedis, formatAmount } from "@/lib/format-amount.ts";
import { useAuth } from "@/providers/auth/index.tsx";

interface Props {
  isOpened: boolean;
  closeModal: () => void;
  content: Content;
  onSubmit: (paymentMethod: ContentPurchase["type"]) => void;
  isLoading?: boolean;
}

export function BuyModal({
  isOpened,
  closeModal,
  content,
  onSubmit,
  isLoading = false,
}: Props) {
  const [paymentMethod, setPaymentMethod] = useState<ContentPurchase["type"]>();
  const { currentUser } = useAuth();

  const handleSubmit = () => {
    if (!paymentMethod) return;

    const walletAmount = currentUser?.wallet ?? 0;
    if (paymentMethod === "WALLET" && walletAmount < content.amount) {
      return errorToast("Insufficient funds in wallet");
    }

    onSubmit(paymentMethod);
  };

  const isButtonDisabled = isLoading || !paymentMethod;

  return (
    <Modal
      onClose={closeModal}
      isOpened={isOpened}
      className="relative w-full p-0 md:w-3/6 lg:w-3/6"
      canBeClosedWithBackdrop={true}
    >
      <div>
        <div className="flex flex-row items-center justify-between bg-gray-100 p-4 text-gray-600">
          <h1 className="font-bold">Choose Payment Method</h1>
        </div>
        <div className="m-5">
          <fieldset className="space-y-4">
            <div className="flex items-center space-x-5">
              <input
                onChange={() => {
                  setPaymentMethod("WALLET");
                }}
                checked={paymentMethod === "WALLET"}
                name="payment-method"
                type="radio"
                className="not-checked:before:hidden relative size-4 appearance-none rounded-full border border-gray-300 bg-white before:absolute before:inset-1 before:rounded-full before:bg-white checked:border-blue-600 checked:bg-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:before:bg-gray-400 forced-colors:appearance-auto forced-colors:before:hidden"
              />
              <div className="md:w-6/6 w-full">
                <WalletCard />
              </div>
            </div>
            <div className="flex items-center space-x-5">
              <input
                name="payment-method"
                onChange={() => {
                  setPaymentMethod("ONE_TIME");
                }}
                checked={paymentMethod === "ONE_TIME"}
                type="radio"
                className="not-checked:before:hidden relative size-4 appearance-none rounded-full border border-gray-300 bg-white before:absolute before:inset-1 before:rounded-full before:bg-white checked:border-blue-600 checked:bg-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:before:bg-gray-400 forced-colors:appearance-auto forced-colors:before:hidden"
              />
              <div className="">
                <img src='/images/payment.png' />
              </div>
            </div>
          </fieldset>
        </div>

        <div className="flex justify-end gap-2 border-t pb-5 pr-5">
          <Button
            type="button"
            disabled={isButtonDisabled}
            onClick={handleSubmit}
            className="mt-5"
            color="primary"
          >
            {isLoading ? "Processing..." : "Buy Content"}
          </Button>
          <Button variant="outlined" className="mt-5" onClick={closeModal}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export function WalletCard() {
  const { currentUser } = useAuth();

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <div className="p-4">
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          <div className="flex w-full flex-col gap-1">
            <div className="flex items-center gap-3">
              <div className="rounded-md border border-gray-200 px-2">
                <span className="text-xs font-bold text-blue-600">MFONI</span>
              </div>
              <h1 className="text-sm font-bold">My Wallet</h1>
            </div>
            <div>
              <span className="text-xs">
                This wallet is your default payment method for all purchases on
                this website.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 md:justify-center">
            <h1 className="text-3xl font-bold">
              {formatAmount(convertPesewasToCedis(currentUser?.wallet ?? 0))}
            </h1>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 border-t border-gray-200 px-4 py-2">
        <Button
          isLink
          href="/account/wallet"
          size="sm"
          variant="outlined"
          className="gap-1"
        >
          Manage
        </Button>
      </div>
    </div>
  );
}
