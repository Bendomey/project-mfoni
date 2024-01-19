import {PinField} from 'react-pin-field'
import {useState} from 'react'
import {Button} from '@/components/button/index.tsx'

export const VerifyOtp = () => {
  const [, setCode] = useState('')

  return (
    <>
      <p className="mt-4 text-zinc-600">
        We sent a code to <span className="font-bold">+233200000000</span>.
      </p>

      <div className="mt-10">
        <PinField
          length={5}
          validate={/^[0-9]$/}
          className="pin-field"
          onChange={setCode}
        />
      </div>

      <Button externalClassName="w-full mt-5" size="lg">
        Verify
      </Button>
    </>
  )
}
