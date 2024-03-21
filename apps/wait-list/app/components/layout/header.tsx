import {Link} from '@remix-run/react'
import {APP_NAME} from '@/constants/index.ts'
import {Button} from '@/components/button/index.tsx'
import {useWaitListModal} from '@/providers/walt-list-popup/index.tsx'
import {TwitterSvg} from '../svgs/twitter.tsx'

export const MFONI_X_URL = 'https://twitter.com/mfoniapp'

type Props = {
  showWaitlist?: boolean
}

export const Header = ({showWaitlist = false}: Props) => {
  const {handleShowWaitListForm} = useWaitListModal()

  return (
    <header className="absolute top-0 z-50 bg-white/10 w-full">
      <nav
        className="mx-auto flex w-full max-w-8xl items-center justify-between py-4 px-4 lg:px-8"
        aria-label="Global"
      >
        <Link reloadDocument relative="path" to="/" className="-m-1.5 p-1.5">
          <div className="flex flex-row items-end">
            <span className="text-4xl text-blue-700 font-extrabold">
              {APP_NAME.slice(0, 1)}
            </span>
            <span className="text-4xl font-extrabold">{APP_NAME.slice(1)}</span>
          </div>
        </Link>
        <div className="flex justify-center items-center mt-3 lg:mt-0 gap-x-4 lg:gap-x-5">
          <a
            className="flex items-center space-x-2"
            rel="noreferrer"
            href={MFONI_X_URL}
            target="_blank"
          >
            <span className="text-sm font-semibold leading-6 text-gray-900 hover:text-blue-900">
              Follow us
            </span>
            <TwitterSvg />
          </a>
          {showWaitlist ? (
            <Button
              onClick={handleShowWaitListForm}
              type="button"
              variant="outline"
            >
              Join waitlist{' '}
              <span className="pl-1" aria-hidden="true">
                &rarr;
              </span>
            </Button>
          ) : (
            <Button href="/learn-more" variant="outline" isHref isLink>
              Learn more{' '}
              <span className="pl-1" aria-hidden="true">
                &rarr;
              </span>
            </Button>
          )}
        </div>
      </nav>
    </header>
  )
}
