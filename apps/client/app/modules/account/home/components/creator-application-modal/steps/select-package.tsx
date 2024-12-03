import {Link} from '@remix-run/react'
import {MFONI_PACKAGES_DETAILED} from '@/constants/index.ts'
import {ExclamationTriangleIcon} from '@heroicons/react/20/solid'

interface Props {
  mfoniPackage: string
  setMfoniPackage: (value: string) => void
  isWalletLow: boolean
}

export function SelectPackage({
  mfoniPackage,
  setMfoniPackage,
  isWalletLow,
}: Props) {
  return (
    <div>
      <h1 className="font-bold text-xl">1. Choose a package</h1>
      <div className="ml-5">
        <p className="text-sm text-gray-600 mt-1">
          The package you select will reflect what your benefits are!{' '}
          <Link
            prefetch="intent"
            to="/#pricing"
            target="_blank"
            className="text-blue-600 hover:underline"
          >
            Click to see packages
          </Link>{' '}
        </p>
        <div className="mt-5 lg:w-5/6">
          <select
            id="package"
            name="package"
            value={mfoniPackage}
            onChange={e => setMfoniPackage(e.target.value)}
            className="mt-2 block w-full rounded-md border-0 py-3 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6"
          >
            <option value="">Please Select</option>
            {Object.entries(MFONI_PACKAGES_DETAILED).map(([key, value]) => (
              <option key={key} value={key}>
                {value.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-600 mt-1">
            <span className="font-bold">Note:</span> You can always change your
            package and make your payments after we&apos;ve approved your
            application.
          </p>
        </div>
        {isWalletLow ? (
          <div className="border-l-4 border-yellow-400 bg-yellow-50 p-4 mt-3">
            <div className="flex">
              <div className="shrink-0">
                <ExclamationTriangleIcon
                  aria-hidden="true"
                  className="size-5 text-yellow-400"
                />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  You are low on wallet balance.
                  <Link
                    to="/account/wallet"
                    prefetch="intent"
                    className="font-medium text-yellow-700 underline hover:text-yellow-600"
                  >
                    Top up here
                  </Link>
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
