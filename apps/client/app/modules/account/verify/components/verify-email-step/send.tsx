import {useUpdateEmail} from '@/api/users/index.ts'
import {Button} from '@/components/button/index.tsx'
import {yupResolver} from '@hookform/resolvers/yup'
import * as Yup from 'yup'
import {useForm} from 'react-hook-form'
import {classNames} from '@/lib/classNames.ts'
import {ExclamationCircleIcon} from '@heroicons/react/24/outline'
import {errorMessagesWrapper} from '@/constants/error-messages.ts'
import {toast} from 'react-hot-toast'
import {useEffect} from 'react'
import {useAuth} from '@/providers/auth/index.tsx'
import {Loader} from '@/components/loader/index.tsx'

const schema = Yup.object().shape({
  emailAddress: Yup.string()
    .required('Email Address is required.')
    .email('Email Address is invalid.'),
})

interface FormValues {
  emailAddress: string
}

interface Props {
  setPage: React.Dispatch<React.SetStateAction<'SendOTP' | 'VerifyOTP'>>
}

export const SendOtp = ({setPage}: Props) => {
  const {currentUser, onUpdateUser} = useAuth()
  const {mutate, isPending: isLoading} = useUpdateEmail()

  const {
    register,
    handleSubmit,
    formState: {errors},
    setValue,
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
  })

  useEffect(() => {
    if (currentUser?.email) {
      setValue('emailAddress', currentUser.email)
    }
  }, [currentUser?.email, setValue])

  const onSubmit = (data: FormValues) => {
    mutate(
      {
        emailAddress: data.emailAddress,
      },
      {
        onSuccess: async () => {
          if(currentUser){
            onUpdateUser({
              ...currentUser,
              email: data.emailAddress,
            })
          }
        
          setPage('VerifyOTP')
        },
        onError: error => {
          if (error.message) {
            toast.error(errorMessagesWrapper(error.message))
          }
        },
      },
    )
  }

  return (
    <>
      <p className="mt-2 text-zinc-600">Provide your email address.</p>

      <form className="w-full" onSubmit={handleSubmit(onSubmit)}>
        <div className="w-full mt-10">
          <div className="relative mt-2 rounded-md shadow-sm">
            <input
              type="text"
              {...register('emailAddress', {required: true})}
              className={classNames(
                'block w-full rounded-md border-0 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6',
                errors.emailAddress ? 'ring-red-500' : 'ring-gray-300',
              )}
              placeholder="youremail@service.com"
            />
            {errors.emailAddress ? (
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
          <Button type="submit" externalClassName="w-full mt-5" size="lg">
            Send OTP
          </Button>
        )}
      </form>
    </>
  )
}
