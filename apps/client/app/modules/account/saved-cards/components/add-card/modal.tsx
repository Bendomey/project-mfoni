import { Dialog } from '@headlessui/react'
import { CreditCardIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid'
import { yupResolver } from '@hookform/resolvers/yup'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import * as Yup from 'yup'
import { Button } from '@/components/button/index.tsx'
import { Loader } from '@/components/loader/index.tsx'
import { Modal } from '@/components/modal/index.tsx'
import { classNames } from '@/lib/classNames.ts'
import { formatAmount } from '@/lib/format-amount.ts'
import { safeString } from '@/lib/strings.ts'
import { useAuth } from '@/providers/auth/index.tsx'

interface Props {
    isOpened: boolean
    onClose: () => void
    onSubmit: (email: string) => void
    isSubmitting?: boolean
}

interface FormValues {
    email: string
}

const schema = Yup.object().shape({
    email: Yup.string().email('Invalid email').required('Email is required'),
})

export function AddSavedCardModal({
    isOpened,
    onClose,
    onSubmit,
    isSubmitting,
}: Props) {
    const [step, setStep] = useState<'INSTRUCTIONS' | 'FORM'>('INSTRUCTIONS')

    let content = <></>

    if (step === 'INSTRUCTIONS') {
        content = <CardInstructions onNext={() => setStep('FORM')} onClose={onClose} />
    } else if (step === 'FORM') {
        content = <Form isOpened={isOpened} onSubmit={onSubmit} onClose={() => setStep('INSTRUCTIONS')} isSubmitting={isSubmitting} />
    }

    return (
        <Modal
            canBeClosedWithBackdrop={false}
            className="w-full md:w-5/12"
            isOpened={isOpened}
            onClose={onClose}
        >
            <div className='flex flex-row items-center space-x-2 border-b  pb-2 mb-5'>
                <div>
                    <CreditCardIcon className="h-12 w-auto text-blue-500" />
                </div>
                <div className=''>
                    <Dialog.Title
                        as="h3"
                        className="text-lg font-semibold leading-6 text-gray-900"
                    >
                        Add a new card
                    </Dialog.Title>
                    <p className="text-xs text-gray-500">
                        You can make payments with this card on the platform.
                    </p>
                </div>
            </div>

            {content}
        </Modal>
    )
}

function CardInstructions({ onNext, onClose }: { onNext: VoidFunction, onClose: VoidFunction }) {
    return (
        <div className='mt-1'>
            <h1 className=' text-lg font-bold'>1. Quick Check</h1>

            <div className='mt-2'>
                <p className='text-sm'>We’ll make a small test charge of <b>{formatAmount(1)}</b> to confirm two things:</p>
                <ul role="list" className="mt-2 text-sm list-disc space-y-2 pl-6 marker:text-gray-300">
                    <li className="pl-2">The card works and can be used for future payments.</li>
                    <li className="pl-2">You approve the card by confirming it with your bank.</li>
                </ul>
            </div>

            <div className='flex justify-end mt-10'>
                <Button
                    variant="outlined"
                    type="button"
                    className="mr-2"
                    onClick={onClose}
                >
                    Cancel
                </Button>
                <Button onClick={onNext} variant="solid" color="primary">
                    Next
                </Button>
            </div>
        </div>
    )
}

function Form({ onSubmit, onClose, isSubmitting }: Props) {
    const { currentUser } = useAuth()
    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
    } = useForm<FormValues>({
        defaultValues: {
            email: safeString(currentUser?.email),
        },
        resolver: yupResolver(schema),
    })

    const isDisabled = isSubmitting || !isValid

    return (
        <form onSubmit={handleSubmit((values) => onSubmit(values.email))}>
            <div className="mt-1">
            <h1 className=' text-lg font-bold'>1. Enter your billing email</h1>
                <small className='text-gray-500 text-xs'>All billing notifications related to this card will be sent to this email.</small>
                <div className="relative mt-4">
                    <input
                        placeholder='Enter your billing email'
                        {...register('email')}
                        className={classNames(
                            'block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-inset sm:text-sm sm:leading-6',
                            errors.email ? 'ring-red-500 focus:ring-red-600' : 'focus:ring-blue-600',
                        )}
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

            <div className="mt-10 flex justify-end">
                <Button
                    variant="outlined"
                    type="button"
                    className="mr-2"
                    onClick={onClose}
                >
                    Back
                </Button>
                <Button disabled={isDisabled} variant="solid" color="primary" type="submit">
                    Initiate test charge
                </Button>

            </div>

            {isSubmitting ? (
                <div className="absolute inset-0 flex h-full w-full items-center justify-center bg-black/40">
                    <Loader color="fill-white" />
                </div>
            ) : null}
        </form>
    );
}