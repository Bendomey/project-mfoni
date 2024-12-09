import {Button} from '@/components/button/index.tsx'
import {Modal} from '@/components/modal/index.tsx'
import {useAuth} from '@/providers/auth/index.tsx'
import {ExclamationTriangleIcon} from '@heroicons/react/24/solid'

interface Props {
  isOpened: boolean
}

const isNotCreatorHeading = "You're not a creator yet"
const isNotCreatorMessage = 'Become a creator to upload content now.'

const hasExhaustedUploadLimitHeading = "You've exhausted your upload limit."
const hasExhaustedUploadLimitMessage = 'Upgrade to upload more!'

export function BlockUploadDialog({isOpened}: Props) {
  const {currentUser} = useAuth()

  const isUserNoCreator = currentUser?.role !== 'CREATOR'

  const heading = isUserNoCreator
    ? isNotCreatorHeading
    : hasExhaustedUploadLimitHeading
  const message = isUserNoCreator
    ? isNotCreatorMessage
    : hasExhaustedUploadLimitMessage

  return (
    <Modal
      onClose={() => {}}
      canBeClosedWithBackdrop={false}
      className="w-full md:w-1/2 lg:w-1/3"
      isOpened={isOpened}
    >
      <div className="flex flex-col justify-center items-center">
        <div className="bg-red-50 p-3 rounded-full">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500" />
        </div>
        <h1 className="font-bold mt-5 text-center text-xl">{heading}</h1>

        <p className="mt-1 text-gray-600 text-center text-sm">{message}</p>

        <div className="mt-5">
          <Button isLink href="/#pricing">
            {isUserNoCreator ? 'Apply Now' : 'Upgrade Now'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
