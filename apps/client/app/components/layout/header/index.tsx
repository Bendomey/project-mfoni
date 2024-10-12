import {Fragment, useState} from 'react'
import {Dialog} from '@headlessui/react'
import {Bars3Icon, XMarkIcon} from '@heroicons/react/24/outline'
import {Link} from '@remix-run/react'
import {APP_NAME} from '@/constants/index.ts'
import {Button} from '@/components/button/index.tsx'
import {SearchPhotos} from './search/index.tsx'
import {SearchPhotosForMobile} from './search-for-mobile/index.tsx'
import {useAuth} from '@/providers/auth/index.tsx'
import {UserAccountMobileNav, UserAccountNav} from './user-account/index.tsx'
import useScroll from '@/hooks/use-scroll.ts'

const navigation = (isLoggedIn: boolean) => [
  {name: 'Explore', href: '/explore', routeType: 'link'},
  isLoggedIn
    ? {name: 'My Account', href: '/account', routeType: 'link'}
    : undefined,
]

interface Props {
  isHeroSearchInVisible: boolean
  shouldHeaderBlur?: boolean
}

export const Header = ({
  isHeroSearchInVisible,
  shouldHeaderBlur = true,
}: Props) => {
  const {isLoggedIn} = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const scrolled = useScroll(50)

  const headerBlurred = shouldHeaderBlur
    ? 'bg-white/95 backdrop-blur-xl sticky top-0 z-50'
    : 'sticky top-0 z-50 bg-white'

  return (
    <header
      className={
        isHeroSearchInVisible
          ? undefined
          : `${scrolled ? headerBlurred : 'sticky top-0 z-50 bg-white '}`
      }
    >
      <nav
        className="mx-auto flex max-w-8xl items-center justify-between py-4 px-4 lg:px-8"
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
        <div className="flex-grow mx-8 hidden md:flex h-11">
          {isHeroSearchInVisible ? null : <SearchPhotos />}
        </div>
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <div className="hidden lg:flex lg:justify-center lg:items-center lg:gap-x-12">
          {navigation(isLoggedIn).map((item, idx) => {
            return (
              <Fragment key={idx}>
                {item && item.routeType === 'link' ? (
                  <Link
                    to={item.href}
                    className="text-sm font-semibold leading-6 text-gray-900 hover:text-blue-900"
                  >
                    {item.name}
                  </Link>
                ) : item && item.routeType === 'href' ? (
                  <a
                    href={item.href}
                    className="text-sm font-semibold leading-6 text-gray-900 hover:text-blue-900"
                  >
                    {item.name}
                  </a>
                ) : null}
              </Fragment>
            )
          })}
          {isLoggedIn ? (
            <UserAccountNav />
          ) : (
            <Button href="/auth" variant="outline" isLink>
              Sign In{' '}
              <span className="pl-1" aria-hidden="true">
                &rarr;
              </span>
            </Button>
          )}
        </div>
      </nav>
      {isHeroSearchInVisible ? null : (
        <div className="mx-4 pb-4 md:pb-0">
          <SearchPhotosForMobile />
        </div>
      )}
      <Dialog
        as="div"
        className="lg:hidden"
        open={mobileMenuOpen}
        onClose={setMobileMenuOpen}
      >
        <div className="fixed inset-0 z-10" />
        <Dialog.Panel className="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <div className="flex items-center justify-between">
            <Link to="/" className="-m-1.5 p-1.5">
              <div className="flex flex-row items-end">
                <span className="text-4xl text-blue-500 font-extrabold">
                  {APP_NAME.slice(0, 1)}
                </span>
                <span className="text-4xl font-extrabold">
                  {APP_NAME.slice(1)}
                </span>
              </div>
            </Link>
            <button
              type="button"
              className="-m-2.5 rounded-md p-2.5 text-gray-700"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="sr-only">Close menu</span>
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-500/10">
              <div className="space-y-2 py-6">
                {navigation(isLoggedIn).map((item, idx) => {
                  return (
                    <Fragment key={idx}>
                      {item && item.routeType === 'link' ? (
                        <Link
                          key={item.name}
                          to={item.href}
                          className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                        >
                          {item.name}
                        </Link>
                      ) : item && item.routeType === 'href' ? (
                        <a
                          onClick={() => setMobileMenuOpen(false)}
                          href={item.href}
                          className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                        >
                          {item.name}
                        </a>
                      ) : null}
                    </Fragment>
                  )
                })}
              </div>
              <div className="py-6">
                {isLoggedIn ? (
                  <UserAccountMobileNav />
                ) : (
                  <Button href="/auth" variant="outline" size="lg" isLink>
                    Sign In
                    <span className="pl-1" aria-hidden="true">
                      &rarr;
                    </span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </Dialog>
    </header>
  )
}
