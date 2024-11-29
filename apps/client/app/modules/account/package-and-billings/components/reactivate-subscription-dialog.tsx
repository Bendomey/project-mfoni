import { useActiveSubscription } from '@/api/subscriptions/index.ts'
import { Button } from '@/components/button/index.tsx'
import { Modal } from '@/components/modal/index.tsx'
import { useAuth } from '@/providers/auth/index.tsx'
import { useState } from 'react'
import { toast } from 'react-hot-toast'

interface Props {
  onClose: () => void
  isOpened: boolean
}

export function ReactivateSubscriptionDialog({ onClose, isOpened }: Props) {
  const { activeSubcription } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const { mutate } = useActiveSubscription()

  const handleSubmit = () => {
    setIsLoading(true)
    if (activeSubcription) {
      mutate({
        period: activeSubcription.period ?? 1,
        pricingPackage: activeSubcription.packageType,
      }, {
        onError: () => {
          toast.error('Failed to re-activate subscription, try again later.')
          setIsLoading(false)
        },
        onSuccess: () => {
          window.location.reload()
        },
      })
    }

  }
  return (
    <Modal
      className="w-full md:w-4/6 lg:w-2/6"
      onClose={onClose}
      isOpened={isOpened}
    >
      <h1 className="font-bold text-lg">Reactivate Subscription?</h1>

      <div className="mt-3">
        <p className="text-sm text-gray-600">
          This action will reactivate your current subscription plan.
        </p>
      </div>

      <div className="mt-4">
        <Button
          onClick={handleSubmit}
          variant="solid"
          disabled={isLoading}
          color="success"
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
