import {Button} from '@/components/button/index.tsx'
import {ArrowUpTrayIcon} from '@heroicons/react/24/outline'
import {CheckBadgeIcon} from '@heroicons/react/24/solid'
import {Link} from '@remix-run/react'

interface ContentUploaderProps {
  open: VoidFunction
}

export const ContentUploader = ({open}: ContentUploaderProps) => {
  return (
    <>
      <div className="flex justify-center">
        <h1 className="font-bold text-xl md:text-4xl w-3/3 md:w-2/3 px-3 md:px-0 text-center mt-5">
          Share your photo masterpieces and captivate the world with your
          creativity!
        </h1>
      </div>
      <div className="flex flex-col max-w-8xl px-4 lg:px-8">
        <div className="border-4 border-dashed border-zinc-100 rounded-3xl py-10 w-full mt-10">
          <div className="flex flex-col justify-center items-center">
            <ArrowUpTrayIcon
              className="text-blue-700 h-14 w-auto"
              strokeWidth={2}
            />
            <h1 className="font-bold text-xl md:text-4xl w-3/3 md:w-72 text-center mt-5">
              Drag and drop to upload, or
            </h1>
            <Button onClick={open} size="lg" externalClassName="mt-7">
              Browse
            </Button>
            <div className="mt-5">
              <p className="font-bold text-zinc-400  md:text-lg">
                (You have <span className="text-blue-600">10 uploads</span>{' '}
                left)
              </p>
            </div>
          </div>
          <div className="mx-4 md:mx-5 xl:mx-16 mt-20 md:mt-28 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-row items-center gap-1 font-medium">
              <CheckBadgeIcon className="text-blue-600 h-5 w-auto" />
              <b>Original</b> content you captured
            </div>
            <div className="flex flex-row items-center gap-1 font-medium">
              <CheckBadgeIcon className="text-blue-600 h-5 w-auto" />
              Mindful of the rights of others
            </div>
            <div className="flex flex-row items-center gap-1 font-medium">
              <CheckBadgeIcon className="text-blue-600 h-5 w-auto" />
              <b>High quality</b> photos and videos
            </div>
            <div className="flex flex-row  flex-wrap gap-1 font-medium">
              <CheckBadgeIcon className="text-blue-600 h-5 w-auto" />
              <b>Zero tolerance</b> for nudity, violence or hate
            </div>
            <div className="flex flex-row items-center gap-1 font-medium">
              <CheckBadgeIcon className="text-blue-600 h-5 w-auto" />
              To be <b>paid</b> or downloaded for <b>free</b>
            </div>
            <div className="flex flex-row items-center gap-1 font-medium">
              <CheckBadgeIcon className="text-blue-600 h-5 w-auto" />
              Read the{' '}
              <Link
                to="/terms"
                target="_blank"
                className="border-b border-dashed border-zinc-600"
              >
                mfoni Terms
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
