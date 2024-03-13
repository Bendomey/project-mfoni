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
import {useJoinWaitList} from '@/api/waitlist.ts'
import {toast} from 'react-hot-toast'
import {Loader} from '@/components/loader/index.tsx'

type Props = {
  show: boolean
  setShow: React.Dispatch<React.SetStateAction<boolean>>
  handleClose: () => void
}

interface FormValues {
  userType: User
  name: string
  email?: string
  phoneNumber: string
}

const schema = Yup.object().shape({
  userType: Yup.string()
    .oneOf(['CLIENT', 'CREATOR'])
    .default('CLIENT')
    .required('Role is required'),
  name: Yup.string().required('Full name is required'),
  phoneNumber: Yup.string().required('Phone number is required'),
  email: Yup.string().email('Invalid email address'),
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
    reset,
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
  })

  const {mutate, isPending} = useJoinWaitList()

  const hasSelectedAccountType = !!selectedAccountType

  useEffect(() => {
    if (selectedAccountType) {
      setValue('userType', selectedAccountType.value)
    }
  }, [selectedAccountType, setValue])

  const onSubmit = useCallback(
    (formData: FormValues) => {
      if (!hasSelectedAccountType) {
        return toast.error('Please select an account type')
      }
      mutate(formData, {
        onSuccess: async () => {
          toast.success('You have been added to the waitlist!', {
            id: 'waitlist-success',
          })
          reset({
            name: '',
            email: '',
            userType: undefined,
            phoneNumber: '',
          })
          setSelectedAccountType(undefined)
          setShow(false)
        },
        onError: error => {
          toast.error(error.message, {id: 'waitlist-error'})
        },
      })
    },
    [hasSelectedAccountType, setSelectedAccountType, setShow, reset, mutate],
  )

  return (
    <SpringModal canClose={!isPending} isOpen={show} setIsOpen={setShow}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <h3 className="text-lg font-medium leading-6 text-center text-gray-900 lg:text-xl">
          Join Our Waitlist
        </h3>
        <div className="mt-2">
          <p className="max-w-2xl mx-auto mb-2 text-sm text-center text-gray-500 lg:text-base">
            Sign up now to join our waitlist and be among the first to access
            exclusive features and updates!
          </p>
          <AccountType
            selectedAccountType={selectedAccountType}
            setSelectedAccountType={setSelectedAccountType}
          />
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
                  'block w-full rounded-md border-0 py-2.5 lg:py-2 text-gray-900 shadow-nome ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset text-xs lg:text-sm sm:leading-6 ',
                  errors.name ? 'ring-red-500' : 'focus:ring-blue-600 ',
                )}
                placeholder="Enter your full name"
                aria-describedby="name"
              />
              {errors.name ? (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <ExclamationCircleIcon
                    className="w-5 h-5 text-red-500"
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
                  'block w-full rounded-md border-0 py-2.5 lg:py-2 text-gray-900 shadow-nome ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset  text-xs lg:text-sm sm:leading-6 ',
                  errors.phoneNumber ? 'ring-red-500' : 'focus:ring-blue-600',
                )}
                placeholder="Enter your phone number"
                aria-describedby="phoneNumber"
              />
              {errors.phoneNumber ? (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <ExclamationCircleIcon
                    className="w-5 h-5 text-red-500"
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
                  'block w-full rounded-md border-0 py-2.5 lg:py-2 text-gray-900 shadow-nome ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset  text-xs lg:text-sm sm:leading-6 ',
                  errors.email ? 'ring-red-500' : 'focus:ring-blue-600',
                )}
                placeholder="Enter your email address"
                aria-describedby="email-optional"
              />
              {errors.email ? (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <ExclamationCircleIcon
                    className="w-5 h-5 text-red-500"
                    aria-hidden="true"
                  />
                </div>
              ) : null}
            </div>
          </div>
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
        {isPending ? (
          <div className="absolute inset-0 flex items-center justify-center w-full h-full bg-black/40">
            <Loader color="fill-white" />
          </div>
        ) : null}
      </form>
    </SpringModal>
  )
}
