import { useState } from 'react'
import { Dialog } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { Link } from "@remix-run/react";
import { APP_NAME } from '@/constants/index.ts';
import { Button } from '@/components/button/index.tsx';
import { SearchPhotos } from './search/index.tsx';
import { SearchPhotosForMobile } from './search-for-mobile/index.tsx';

const navigation = [
  { name: 'Explore', href: '/explore' },
  { name: 'Terms Of Use', href: '/terms' },
  { name: 'Log in', href: '/login' },
]

interface Props {
  isHeroSearchInVisible: boolean
}

export const Header = ({ isHeroSearchInVisible }: Props) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className={isHeroSearchInVisible ? undefined : "sticky top-0 bg-white"}>
      <nav className="mx-auto flex max-w-8xl items-center justify-between py-4 px-4 lg:px-8" aria-label="Global">
        <Link to="/" className="-m-1.5 p-1.5">
          <div className='flex flex-row items-end'>
            <span className="text-4xl text-blue-700 font-extrabold">{APP_NAME.slice(0, 1)}</span>
            <span className="text-4xl font-extrabold">{APP_NAME.slice(1)}</span>
          </div>
        </Link>
        <div className='flex-grow mx-8 hidden md:flex'>
          {
            isHeroSearchInVisible ? null : <SearchPhotos />
          }
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
          {navigation.map((item) => (
            <Link key={item.name} to={item.href} className="text-sm font-semibold leading-6 text-gray-900 hover:text-blue-900">
              {item.name}
            </Link>
          ))}
          <Button href='/upload' variant='outline' isLink>Upload a Photo <span aria-hidden="true">&rarr;</span></Button>
        </div>
      </nav>
      {
        isHeroSearchInVisible ? null : (
          <div className='mt-20'>
            <SearchPhotosForMobile />
          </div>
        )
      }
      <Dialog as="div" className="lg:hidden" open={mobileMenuOpen} onClose={setMobileMenuOpen}>
        <div className="fixed inset-0 z-10" />
        <Dialog.Panel className="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <div className="flex items-center justify-between">
            <Link to="/" className="-m-1.5 p-1.5">
              <div className='flex flex-row items-end'>
                <span className="text-4xl text-blue-500 font-extrabold">{APP_NAME.slice(0, 1)}</span>
                <span className="text-4xl font-extrabold">{APP_NAME.slice(1)}</span>
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
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
              <div className="py-6">
                <Button href='/upload' variant='outline' size='lg' isLink>Upload a Photo <span aria-hidden="true">&rarr;</span></Button>
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </Dialog>
    </header>
  )
}
