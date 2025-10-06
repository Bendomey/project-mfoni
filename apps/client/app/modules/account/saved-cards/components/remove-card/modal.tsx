import { XCircleIcon } from '@heroicons/react/24/solid'
import { Link } from '@remix-run/react'
import { Button } from '@/components/button/index.tsx'
import { Loader } from '@/components/loader/index.tsx'
import { Modal } from '@/components/modal/index.tsx'
import { useAuth } from '@/providers/auth/index.tsx'

interface Props {
    isOpened: boolean
    onClose: () => void
    onSubmit: () => void
    isSubmitting?: boolean
    savedCard: SavedCard
}

export function RemoveCardModal({
    isOpened,
    onClose,
    onSubmit,
    isSubmitting,
    savedCard,
}: Props) {
    const { currentUser } = useAuth()

    const defaultForCreatorSubscription = currentUser?.creator?.subscriptionPaymentMethod === 'SAVED_CARD'
    const isPrimaryCard = savedCard?.defaultedAt !== null

    const cannotRemovePrimaryCard = isPrimaryCard && defaultForCreatorSubscription

    return (
        <Modal
            canBeClosedWithBackdrop={false}
            className="w-full md:w-1/3"
            isOpened={isOpened}
            onClose={onClose}
        >


            <div className='mt-1'>
                <h1 className=' text-lg font-bold'>Are you sure you want to delete this card?</h1>

                <div className='mt-1'>
                    <p className='text-sm text-gray-600'>This action cannot be undone.</p>
                    {
                        cannotRemovePrimaryCard ? (
                            <div className='ml-2 mt-5'>
                                <div className='flex flex-row items-start gap-3'>
                                    <XCircleIcon className='h-6 w-auto text-red-600' />
                                    <span className='text-sm'>To remove this card, you must switch to a different payment method <Link to="/account/package-and-billings?change-payment-method=true" className='underline text-blue-600'>here</Link>.</span>
                                </div>
                            </div>
                        ) : null
                    }
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
                    <Button disabled={cannotRemovePrimaryCard} onClick={onSubmit} variant="solid" color="danger">
                        Remove
                    </Button>
                </div>
            </div>

            {
                isSubmitting ? (
                    <div className="absolute inset-0 flex h-full w-full items-center justify-center bg-black/40">
                        <Loader color="fill-white" />
                    </div>
                ) : null
            }
        </Modal>
    )
}
