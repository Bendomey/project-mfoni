import {ExclamationTriangleIcon} from '@heroicons/react/24/solid'
import {useMemo} from 'react'
import {type Content} from '../context.tsx'
// import { FlyoutContainer } from "@/components/flyout/flyout-container.tsx"

export const ContentSideViewer = ({
  content,
  activeContent,
  onSelect,
}: {
  content: Content
  activeContent: boolean
  onSelect: VoidFunction
}) => {
  const imageUrl = useMemo(
    () => URL.createObjectURL(content.file),
    [content.file],
  )
  const isRejected = useMemo(
    () => content.status === 'rejected',
    [content.status],
  )

  // TODO: add error flyout in the future.
  // const ErrorTag = () => {
  //     return (
  //         <div className="bg-red-600 z-10 p-5 w-[45vw] rounded-xl">
  //             <h1 className="text-white font-bold">{content.message}</h1>
  //         </div>
  //     )
  // }

  return (
    // <FlyoutContainer intendedPosition="x" FlyoutContent={undefined} arrowColor="bg-red-600">
    <div
      onClick={onSelect}
      aria-hidden="true"
      className={`relative cursor-pointer bg-zinc-100 h-[12vh] w-[23vw] md:w-[7vw] flex justify-center items-center rounded-lg ring-offset-2 ${
        isRejected ? 'ring-red-600 ' : 'ring-blue-400'
      } ${activeContent ? 'ring' : 'ring-0'}`}
      style={{
        backgroundImage: `url(${imageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {isRejected ? (
        <div className="absolute top-0 z-1 h-full w-full bg-red-600 bg-opacity-90 rounded-lg">
          <div className="flex justify-center items-center h-full w-full">
            <ExclamationTriangleIcon className="text-white h-10 w-auto" />
          </div>
        </div>
      ) : null}
    </div>
    // </FlyoutContainer>
  )
}
