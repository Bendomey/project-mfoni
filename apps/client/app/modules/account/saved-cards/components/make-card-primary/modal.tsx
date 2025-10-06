import { Button } from '@/components/button/index.tsx'
import { Loader } from '@/components/loader/index.tsx'
import { Modal } from '@/components/modal/index.tsx'

interface Props {
    isOpened: boolean
    onClose: () => void
    onSubmit: () => void
    isSubmitting?: boolean
    savedCard: SavedCard
}

export function MakeCardPrimaryModal({
    isOpened,
    onClose,
    onSubmit,
    isSubmitting,
    savedCard,
}: Props) {
    return (
        <Modal
            canBeClosedWithBackdrop={false}
            className="w-full md:w-1/3"
            isOpened={isOpened}
            onClose={onClose}
        >
            <div className='mt-1'>
                {
                    savedCard.defaultedAt ? (
                        <h1 className=' text-lg font-bold'>This card is already your primary card.</h1>
                    ) : (
                        <h1 className=' text-lg font-bold'>Are you sure you want to make this card primary?</h1>
                    )
                }

                <div className='flex justify-end mt-10'>
                    <Button
                        variant="outlined"
                        type="button"
                        className="mr-2"
                        onClick={onClose}
                    >
                        Cancel
                    </Button>
                    <Button disabled={Boolean(savedCard?.defaultedAt)} onClick={onSubmit} variant="solid" color="success">
                        Make Primary
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
