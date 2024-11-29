import {useCancelSubscription} from '@/api/subscriptions/index.ts'
import {Button} from '@/components/button/index.tsx'
import {Modal} from '@/components/modal/index.tsx'
import dayjs from 'dayjs'
import {useState} from 'react'
import {toast} from 'react-hot-toast'

interface Props {
  onClose: () => void
  isOpened: boolean
}

export function CancelSubscriptionDialog({onClose, isOpened}: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const {mutate} = useCancelSubscription()

  const handleSubmit = () => {
    setIsLoading(true)
    mutate(undefined, {
      onError: () => {
        toast.error('Failed to cancel subscription, try again later.')
        setIsLoading(false)
      },
      onSuccess: () => {
        window.location.reload()
      },
    })
  }
  return (
    <Modal
      className="w-full md:w-4/6 lg:w-2/6"
      onClose={onClose}
      isOpened={isOpened}
    >
      <h1 className="font-bold text-lg">Cancel Subscription?</h1>

      <div className="mt-3">
        <p className="text-sm text-gray-600">
          This action will end your current subscription plan. You&apos;ll still
          have access to your current subscription until {dayjs().format('L')}
        </p>
      </div>

      <div className="mt-4">
        <Button
          onClick={handleSubmit}
          variant="solid"
          disabled={isLoading}
          color="danger"
          type="button"
        >
          Continue
        </Button>
        <Button
          variant="outlined"
          type="button"
          className="ml-2"
          onClick={onClose}
        >
          Close
        </Button>
      </div>
    </Modal>
  )
}
