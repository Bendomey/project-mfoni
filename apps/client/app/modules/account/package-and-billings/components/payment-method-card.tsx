import {Button} from '@/components/button/index.tsx'
import {convertPesewasToCedis, formatAmount} from '@/lib/format-amount.ts'
import {useAuth} from '@/providers/auth/index.tsx'

export function PaymentMethodCard() {
  const {currentUser} = useAuth()
  return (
    <div className="bg-white border p-5 border-gray-200 rounded-lg ">
      <div className="flex flex-col gap-1">
        <h1 className="font-bold">Payment Method</h1>
        <p className="text-xs text-gray-500">
          Change how you play for your plan.
        </p>
      </div>

      <div className="mt-5">
        <div className="flex gap-2 md:hidden mb-2">
          <Button size="sm" isLink href="/account/wallet">
            Topup
          </Button>
          <Button size="sm" disabled variant="outlined">
            Edit
          </Button>
        </div>
        <div className="rounded-md flex items-start justify-between border border-gray-100 p-3">
          <div className="flex items-start gap-3">
            <div className="border border-gray-200 px-2 rounded-md py-1">
              <span className="text-xs font-bold text-blue-600">MFONI</span>
            </div>
            <div>
              <div className="flex items-center gap-1">
                <h1 className="font-bold text-sm">My Wallet</h1>
                <span className="inline-flex items-center gap-x-1.5 rounded-full px-2 py-1 text-[10px] font-bold text-gray-900 ring-1 ring-inset ring-gray-500">
                  Default
                </span>
              </div>
              <div className="mt-1">
                <span className="font-light">
                  {formatAmount(
                    convertPesewasToCedis(currentUser?.wallet ?? 0),
                  )}
                </span>
              </div>
            </div>
          </div>
          <div className="hidden md:flex gap-2">
            <Button size="sm" isLink href="/account/wallet">
              Topup
            </Button>
            <Button size="sm" disabled variant="outlined">
              Edit
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
