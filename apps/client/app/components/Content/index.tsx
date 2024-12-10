import { Button } from '../button/index.tsx'
import { LockClosedIcon, HeartIcon } from '@heroicons/react/24/outline'
import { PhotographerCreatorCard } from '../creator-card/index.tsx'
import { FlyoutContainer } from '../flyout/flyout-container.tsx'
import { Link } from '@remix-run/react'
import { Image } from 'remix-image'
import { blurDataURL, PAGES } from '@/constants/index.ts'

interface Props {
  content: Content
  showCreator?: boolean
}

export const Content = ({ content, showCreator = true }: Props) => {
  return (
    <Link to={PAGES.PHOTO.replace(':slug', content.slug)} state={{ modal: true }}>
      <div className="cursor-zoom-in mb-5 relative ">
        <Image
          src={content.media.url}
          className="h-auto max-w-full rounded-lg"
          blurDataURL={blurDataURL}
          alt={content.title}
        />

        <div className="group hover:bg-black/50 w-full h-full rounded-lg absolute top-0">
          <div className="p-2 flex flex-col justify-between h-full w-full">
            <div className="flex flex-row items-center justify-between p-2">
              <div>
                {
                  content.amount > 0 ? (
                    <div className="bg-black px-3 py-1 rounded-full text-white text-sm font-semibold">
                      mfoni+
                    </div>
                  ) : null
                }
              </div>
              <div className="group-hover:block hidden">
                <Button variant="outlined" size="sm">
                  <HeartIcon className="h-6 w-6 text-zinc-700" />
                </Button>
              </div>
            </div>
            <div className="group-hover:flex hidden flex-row items-center justify-between gap-2.5">
              {
                showCreator && content.createdBy ? (
                  <FlyoutContainer
                    intendedPosition="y"
                    FlyoutContent={PhotographerCreatorCard}
                  >
                    <div className="flex items-center">
                      <Image
                        className="inline-block h-7 w-7 rounded-full"
                        src={content.createdBy.photo}
                        alt={content.createdBy.name}
                      />
                      <span className="ml-2 text-white font-medium text-sm">
                        {content.createdBy.name}
                      </span>
                    </div>
                  </FlyoutContainer>
                ) : <div />
              }

              <div>
                <Button variant="outlined">
                  <LockClosedIcon className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
