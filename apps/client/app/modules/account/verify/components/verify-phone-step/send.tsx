import {useUpdatePhone} from '@/api/users/index.ts'
import {Button} from '@/components/button/index.tsx'
import {yupResolver} from '@hookform/resolvers/yup'
import * as Yup from 'yup'
import {useForm} from 'react-hook-form'
import {classNames} from '@/lib/classNames.ts'
import {ExclamationCircleIcon} from '@heroicons/react/24/outline'
import {errorMessagesWrapper} from '@/constants/error-messages.ts'
import {useEffect} from 'react'
import {useAuth} from '@/providers/auth/index.tsx'
import {Loader} from '@/components/loader/index.tsx'
import { errorToast } from '@/lib/custom-toast-functions.tsx'

const schema = Yup.object().shape({
  phoneNumber: Yup.string()
    .required('Phone Number is required.')
    .matches(/^[0-9]+$/, 'Phone Number is invalid.')
    .test('len', 'Phone Number must be 10 digits.', val => val.length === 10),
})

interface FormValues {
  phoneNumber: string
}

interface Props {
  setPage: React.Dispatch<React.SetStateAction<'SendOTP' | 'VerifyOTP'>>
}

export const SendOtp = ({setPage}: Props) => {
  const {currentUser, onUpdateUser} = useAuth()
  const {mutate, isPending: isLoading} = useUpdatePhone()

  const {
    register,
    handleSubmit,
    formState: {errors},
    setValue,
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
  })

  useEffect(() => {
    if (currentUser?.phoneNumber) {
      setValue('phoneNumber', `0${currentUser.phoneNumber.slice(-9)}`)
    }
  }, [currentUser?.phoneNumber, setValue])

  const onSubmit = (data: FormValues) => {
    const normalizedPhoneNumber = `233${data.phoneNumber.slice(-9)}`
    mutate(
      {
        phoneNumber: normalizedPhoneNumber,
      },
      {
        onSuccess: async () => {
          if (currentUser) {
            onUpdateUser({
              ...currentUser,
              phoneNumber: normalizedPhoneNumber,
            })
          }

          setPage('VerifyOTP')
        },
        onError: error => {
          if (error.message) {
            errorToast(errorMessagesWrapper(error.message))
          }
        },
      },
    )
  }

  return (
    <>
      <p className="mt-2 text-zinc-600">Provide your phone number.</p>

      <form className="w-full" onSubmit={handleSubmit(onSubmit)}>
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
              {...register('phoneNumber', {required: true})}
              className={classNames(
                'block w-full rounded-md border-0 py-3 pl-16 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6',
                errors.phoneNumber ? 'ring-red-500' : 'ring-gray-300',
              )}
              placeholder="0240000000"
            />
            {errors.phoneNumber ? (
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <ExclamationCircleIcon
                  className="h-5 w-5 text-red-500"
                  aria-hidden="true"
                />
              </div>
            ) : null}
          </div>
        </div>

        {isLoading ? (
          <div className="mt-10 flex justify-center items-center">
            <Loader color="fill-blue-600" />
          </div>
        ) : (
          <Button
            type="submit"
            className="w-full justify-center mt-5"
            size="lg"
          >
            Send OTP
          </Button>
        )}
      </form>
    </>
  )
}
