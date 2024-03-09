import {Link} from '@remix-run/react'
import {APP_NAME} from '@/constants/index.ts'
import {Button} from '@/components/button/index.tsx'

export const Header = () => {
  return (
    <header className="absolute top-0 z-50 bg-white/10 w-full">
      <nav
        className="mx-auto flex w-full max-w-8xl items-center justify-between py-4 px-4 lg:px-8"
        aria-label="Global"
      >
        <Link to="/" className="-m-1.5 p-1.5">
          <div className="flex flex-row items-end">
            <span className="text-4xl text-blue-700 font-extrabold">
              {APP_NAME.slice(0, 1)}
            </span>
            <span className="text-4xl font-extrabold">{APP_NAME.slice(1)}</span>
          </div>
        </Link>

        <div className="flex justify-center items-center gap-x-12">
          <Button href="/learn-more" variant="outline" isLink>
            Learn more{' '}
            <span className="pl-1" aria-hidden="true">
              &rarr;
            </span>
          </Button>
        </div>
      </nav>
    </header>
  )
}
