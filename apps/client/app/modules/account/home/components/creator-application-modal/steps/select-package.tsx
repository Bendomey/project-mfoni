import {Link} from '@remix-run/react'
import {MFONI_PACKAGES_DETAILED} from '@/constants/index.ts'

interface Props {
  mfoniPackage: string
  setMfoniPackage: (value: string) => void
}

export function SelectPackage({mfoniPackage, setMfoniPackage}: Props) {
  return (
    <div>
      <h1 className="font-bold text-xl">1. Choose a package</h1>
      <div className="ml-5">
        <p className="text-sm text-gray-600 mt-1">
          The package you select will reflect what your benefits are!{' '}
          <Link
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
      </div>
    </div>
  )
}