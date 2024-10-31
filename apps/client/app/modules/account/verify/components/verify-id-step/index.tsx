import {Button} from '@/components/button/index.tsx'
import {isBrowser} from '@/lib/is-browser.ts'
import {
  CreditCardIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline'
import {useLoaderData} from '@remix-run/react'
import {useCallback, useEffect, useState} from 'react'
import * as Yup from 'yup'
import {useForm} from 'react-hook-form'
import {yupResolver} from '@hookform/resolvers/yup'
import {classNames} from '@/lib/classNames.ts'
import {toast} from 'react-hot-toast'
import {useAuth} from '@/providers/auth/index.tsx'
import {useVerifyCreator} from '../../context.tsx'

type MetricVerify = (type: string, payload: any, callback: any) => void

type IDType = 'GHANA_CARD' | 'VOTER' | 'PASSPORT' | 'DRIVER_LICENCE'

declare global {
  interface Window {
    // TODO: type it later.
    Metric?: any
  }
}

const getPlaceholderBasedOnType = (type: IDType) => {
  switch (type) {
    case 'GHANA_CARD':
      return 'GHA-XXXXXXXXX-X'
    case 'VOTER':
      return 'XXXXXXXXXXX'
    case 'PASSPORT':
      return 'GXXXXXXX'
    case 'DRIVER_LICENCE':
      return 'XXXXXXXXX'

    default:
      return 'XXXXXXXX'
  }
}

interface FormValues {
  type: IDType
  cardNumber: string
  dob?: string
}

const schema = Yup.object().shape({
  type: Yup.string()
    .oneOf(['GHANA_CARD', 'VOTER', 'PASSPORT', 'DRIVER_LICENCE'])
    .required('Type is required'),
  cardNumber: Yup.string().required('Card Number is required'),
  dob: Yup.string(),
})

export const VerifyIdStep = () => {
  const loaderData = useLoaderData<{
    METRIC_CLIENT_ID: string
    METRIC_CLIENT_SECRET: string
  }>()
  const [metric, setMetric] = useState<{verify: MetricVerify}>()
  const {currentUser} = useAuth()
  const {setActiveStep} = useVerifyCreator()

  const {
    register,
    handleSubmit,
    formState: {errors},
    watch,
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
  })

  const idTypeSelected = watch('type')

  const init = useCallback(() => {
    if (window.Metric) {
      const metricInstance = new window.Metric({
        client_id: loaderData.METRIC_CLIENT_ID,
        client_secret: loaderData.METRIC_CLIENT_SECRET,
      })

      setMetric(metricInstance)
    }
  }, [loaderData.METRIC_CLIENT_ID, loaderData.METRIC_CLIENT_SECRET])

  const onSubmit = (data: FormValues) => {
    if (data.type === 'DRIVER_LICENCE' && !data.dob) {
      return toast.error('Date of Birth is required', {id: 'dob-required'})
    }

    if (!currentUser?.phoneNumber) {
      return toast.error('Kindly verify your phone number to proceed', {
        id: 'phone-number-required',
      })
    }

    if (metric?.verify) {
      const phoneNumber = `0${currentUser.phoneNumber.slice(-9)}`
      metric.verify(
        data.type,
        {
          card_number: data.cardNumber,
          reference_id: phoneNumber,
          purpose: `Verifying ${currentUser.name}'s identity.`,
          phone_number: phoneNumber,
          date_of_birth: data.dob ?? undefined,
        },
        (results: {status: 'FAILED' | 'SUCCESSFUL'}) => {
          if (results.status === 'SUCCESSFUL') {
            setActiveStep('welcome')
            return toast.success('Your identity was verified successfully', {
              id: 'identity-verification-success',
            })
          } else {
            return toast.error(
              'Failed to verify your account. Please try again.',
              {
                id: 'identity-verification-failed',
              },
            )
          }
        },
      )
    } else {
      // throw error to sentry
      return toast.error('An error occurred. Please try again later', {
        id: 'metric-error',
      })
    }
  }

  useEffect(() => {
    if (isBrowser) {
      init()
    }
  }, [init])

  return (
    <div className="flex flex-col items-center ">
      <CreditCardIcon className="h-20 w-auto text-zinc-400 mb-5" />
      <h1 className="text-3xl font-bold">Verify your ID</h1>

      <form className="w-full" onSubmit={handleSubmit(onSubmit)}>
        <div className="mt-10">
          <div className="relative rounded-md shadow-sm">
            <label className="text-sm mb-3 text-gray-700">Type</label>
            <select
              {...register('type', {required: true})}
              className={classNames(
                'block w-full rounded-md border-0 p-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 mt-1',
                errors.type ? 'ring-red-500' : '',
              )}
            >
              <option value="">Please Select</option>
              <option value="GHANA_CARD">Ghana Card</option>
              <option value="VOTER">Voter&apos;s ID</option>
              <option value="PASSPORT">Passport</option>
              <option value="DRIVER_LICENCE">Driver&apos;s License</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          <div className="relative rounded-md shadow-sm">
            <label className="text-sm mb-3 text-gray-700">Card Number</label>
            <input
              type="text"
              {...register('cardNumber', {required: true})}
              className={classNames(
                'block w-full rounded-md border-0 p-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 mt-1',
                errors.cardNumber ? 'ring-red-500' : '',
              )}
              placeholder={getPlaceholderBasedOnType(idTypeSelected)}
            />
            {errors.cardNumber ? (
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 top-6">
                <ExclamationCircleIcon
                  className="h-5 w-5 text-red-500"
                  aria-hidden="true"
                />
              </div>
            ) : null}
          </div>
        </div>

        {idTypeSelected === 'DRIVER_LICENCE' ? (
          <div className="mt-4">
            <div className="relative rounded-md shadow-sm">
              <label className="text-sm mb-3 text-gray-700">
                Date Of Birth
              </label>
              <input
                type="date"
                {...register('dob', {required: true})}
                className={classNames(
                  'block w-full rounded-md border-0 p-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 mt-1',
                  errors.dob ? 'ring-red-500' : '',
                )}
              />
              {errors.dob ? (
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 top-6">
                  <ExclamationCircleIcon
                    className="h-5 w-5 text-red-500"
                    aria-hidden="true"
                  />
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        <Button type="submit" className="w-full justify-center mt-5" size="lg">
          Initiate Verification
        </Button>
      </form>
    </div>
  )
}
