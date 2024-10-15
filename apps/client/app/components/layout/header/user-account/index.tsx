import { useValidateImage } from '@/hooks/use-validate-image.tsx'
import { classNames } from '@/lib/classNames.ts'
import { useAuth } from '@/providers/auth/index.tsx'
import { Menu, Transition } from '@headlessui/react'
import { Link } from '@remix-run/react'
import { Fragment } from 'react'

const getNameInitials = (name: string) => name.split(' ').map((n) => n[0]).join('')

export const UserAccountNav = () => {
  const { currentUser } = useAuth()
  const isProfilePhotoValid = useValidateImage(currentUser?.photo ?? '')
  const initials = getNameInitials(currentUser?.name ?? '')

  return (
    <Menu as="div" className="relative ml-3">
      <div>
        <Menu.Button className="relative flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
          <span className="absolute -inset-1.5" />
          <span className="sr-only">Open user menu</span>
          {
            isProfilePhotoValid && currentUser?.photo ? (
              <img
                className="h-8 w-8 rounded-full"
                src={currentUser.photo}
                alt={currentUser.name}
              />
            ) : (
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-600">
                <span className="text-sm font-medium leading-none text-white">{initials}</span>
              </span>
            )
          }
        </Menu.Button>
      </div>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <Menu.Item>
            <div className="block px-4 py-2 w-full text-sm items-start text-gray-700">
              Logged in as <strong>{currentUser?.name}</strong>
            </div>
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <button
                className={classNames(
                  active ? 'bg-gray-100' : '',
                  'flex px-4 py-2 w-full focus:outline-none text-sm items-start text-gray-700',
                )}
              >
                Settings
              </button>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <button
                type="button"
                onClick={() => {
                  window.location.href = '/auth'
                }}
                className={classNames(
                  active ? 'bg-gray-100' : '',
                  'flex px-4 py-2 w-full focus:outline-none text-sm items-start text-gray-700',
                )}
              >
                Logout
              </button>
            )}
          </Menu.Item>
        </Menu.Items>
      </Transition>
    </Menu>
  )
}

export const UserAccountMobileNav = () => {
  const { currentUser } = useAuth()
  const isProfilePhotoValid = useValidateImage(currentUser?.photo ?? '')
  const initials = getNameInitials(currentUser?.name ?? '')


  return (
    <div className=" pb-3 pt-2">
      <div className="flex items-center">
        <div className="flex-shrink-0">
        {
            isProfilePhotoValid && currentUser?.photo ? (
              <img
                className="h-8 w-8 rounded-full"
                src={currentUser.photo}
                alt={currentUser.name}
              />
            ) : (
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-600">
                <span className="text-sm font-medium leading-none text-white">{initials}</span>
              </span>
            )
          }
        </div>
        <div className="ml-3">
          <div className="text-base font-medium text-gray-800">
            {currentUser?.name}
          </div>
          <div className="text-sm font-medium text-gray-500">
            {currentUser?.email ?? ''}
          </div>
        </div>
      </div>
      <div className="mt-6 space-y-1">
        <button className="flex items-start w-full  py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800">
          Settings
        </button>
        <Link
          to="/auth"
          className="flex focus:outline-none items-start w-full  py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
        >
          Logout
        </Link>
      </div>
    </div>
  )
}
