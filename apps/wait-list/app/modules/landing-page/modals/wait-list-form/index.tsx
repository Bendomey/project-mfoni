import * as Yup from 'yup'
import {SpringModal} from '@/components/spring-modal/index.tsx'
import {useForm} from 'react-hook-form'
import {yupResolver} from '@hookform/resolvers/yup'
import {classNames} from '@/lib/classNames.ts'
import {ExclamationCircleIcon} from '@heroicons/react/24/outline'
import {Button} from '@/components/button/index.tsx'
import {useCallback, useEffect, useState} from 'react'
import AccountType, {
  type AccountTypeOption,
} from '../../components/account-type.tsx'

type Props = {
  show: boolean
  setShow: React.Dispatch<React.SetStateAction<boolean>>
  handleClose: () => void
}

interface FormValues {
  role: User
  name: string
  email?: string
  phoneNumber: string
}

const schema = Yup.object().shape({
  role: Yup.string()
    .oneOf(['CLIENT', 'CREATOR'])
    .default('CLIENT')
    .required('Role is required'),
  name: Yup.string().required('Full name is required'),
  phoneNumber: Yup.string().required('Phone number is required'),
  email: Yup.string(),
})

export default function WaitListForm({show, setShow, handleClose}: Props) {
  const [selectedAccountType, setSelectedAccountType] = useState<
    AccountTypeOption | undefined
  >()
  const {
    register,
    handleSubmit,
    formState: {errors},
    setValue,
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
  })

  useEffect(() => {
    if (selectedAccountType) {
      setValue('role', selectedAccountType.value)
    }
  }, [selectedAccountType, setValue])

  const onSubmit = useCallback((data: FormValues) => {
    console.log(data)
  }, [])

  return (
    <SpringModal isOpen={show} setIsOpen={setShow}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <h3 className="lg:text-xl text-lg font-medium leading-6 text-center text-gray-900">
          Join Our Waitlist
        </h3>
        <div className="mt-2">
          <p className="lg:text-base text-sm text-center text-gray-500 max-w-2xl mx-auto">
            Sign up now to join our waitlist and be among the first to access
            exclusive features and updates!
          </p>

          <div className="mt-3">
            <div className="flex justify-between">
              <label
                htmlFor="name"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Full Name
              </label>
            </div>
            <div className="relative mt-2">
              <input
                type="text"
                {...register('name')}
                className={classNames(
                  'block w-full rounded-md border-0 py-2.5 lg:py-2 text-gray-900 shadow-nome ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 text-xs lg:text-sm sm:leading-6 ',
                  errors.name ? 'ring-red-500' : '',
                )}
                placeholder="Enter your full name"
                aria-describedby="name"
              />
              {errors.name ? (
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <ExclamationCircleIcon
                    className="h-5 w-5 text-red-500"
                    aria-hidden="true"
                  />
                </div>
              ) : null}
            </div>
          </div>

          <div className="mt-3">
            <div className="flex justify-between">
              <label
                htmlFor="phoneNumber"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Phone Number
              </label>
            </div>
            <div className="relative mt-2">
              <input
                type="text"
                {...register('phoneNumber')}
                className={classNames(
                  'block w-full rounded-md border-0 py-2.5 lg:py-2 text-gray-900 shadow-nome ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 text-xs lg:text-sm sm:leading-6 ',
                  errors.phoneNumber ? 'ring-red-500' : '',
                )}
                placeholder="Enter your phone number"
                aria-describedby="phoneNumber"
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

          <div className="mt-3">
            <div className="flex flex-row items-center justify-between">
              <label
                htmlFor="email"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Email Address
              </label>
              <span className="block text-xs font-medium leading-6 text-red-600">
                Optional
              </span>
            </div>
            <div className="relative mt-2">
              <input
                type="text"
                {...register('email')}
                className={classNames(
                  'block w-full rounded-md border-0 py-2.5 lg:py-2 text-gray-900 shadow-nome ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 text-xs lg:text-sm sm:leading-6 ',
                  errors.email ? 'ring-red-500' : '',
                )}
                placeholder="Enter your email address"
                aria-describedby="email-optional"
              />
              {errors.email ? (
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <ExclamationCircleIcon
                    className="h-5 w-5 text-red-500"
                    aria-hidden="true"
                  />
                </div>
              ) : null}
            </div>
          </div>
          <AccountType
            selectedAccountType={selectedAccountType}
            setSelectedAccountType={setSelectedAccountType}
          />
        </div>

        <div className="mt-8">
          <Button
            variant="unstyled"
            type="submit"
            externalClassName="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2.5 lg:py-2 text-sm font-medium text-blue-800 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            Join Waitlist!
          </Button>
          <Button
            variant="outline"
            type="button"
            externalClassName=" ml-2 "
            onClick={handleClose}
          >
            Close
          </Button>
        </div>
      </form>
    </SpringModal>
  )
}
