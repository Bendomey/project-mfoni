import {Button} from '@/components/button/index.tsx'

export const SendOtp = () => {
  return (
    <>
      <p className="mt-2 text-zinc-600">Provide your phone number.</p>

      <div className="w-full mt-10">
        <div className="relative mt-2 rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 flex items-center">
            <label htmlFor="country" className="sr-only">
              Country
            </label>
            <select
              id="country"
              name="country"
              autoComplete="country"
              className="h-full rounded-md border-0 bg-transparent py-0 pl-3 pr-7 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-zinc-200 sm:text-sm"
            >
              <option>GH</option>
            </select>
          </div>
          <input
            type="text"
            name="phone-number"
            id="phone-number"
            className="block w-full rounded-md border-0 py-3 pl-16 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-zinc-200 sm:leading-6"
            placeholder="0240000000"
          />
        </div>
      </div>

      <Button externalClassName="w-full mt-5" size="lg">
        Send OTP
      </Button>
    </>
  )
}
