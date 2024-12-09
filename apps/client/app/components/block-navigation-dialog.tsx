import {Button} from '@/components/button/index.tsx'
import {Modal} from '@/components/modal/index.tsx'
import {ExclamationTriangleIcon} from '@heroicons/react/24/solid'
import {type unstable_Blocker} from '@remix-run/react'

interface Props {
  blocker: unstable_Blocker
}

export function BlockNavigationDialog({blocker}: Props) {
  return (
    <Modal
      onClose={() => {}}
      canBeClosedWithBackdrop={false}
      className="w-full md:w-1/2 lg:w-1/3"
      isOpened={blocker.state === 'blocked'}
    >
      <div className="flex flex-col justify-center items-center">
        <div className="bg-yellow-50 p-3 rounded-full">
          <ExclamationTriangleIcon className="h-12 w-12 text-yellow-500" />
        </div>
        <h1 className="font-bold mt-5 text-center text-xl">
          You have unsaved changes.
        </h1>

        <p className="mt-1 text-gray-600 text-center text-sm">
          Are you sure you want to leave?
        </p>

        <div className="mt-5 flex items-center gap-3">
          <Button onClick={() => blocker.proceed?.()}>Proceed</Button>
          <Button color="secondaryGhost" onClick={() => blocker.reset?.()}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  )
}
