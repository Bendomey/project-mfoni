import {classNames} from '@/lib/classNames.ts'
import {useAuth} from '@/providers/auth/index.tsx'
import {Menu, Transition} from '@headlessui/react'
import {Fragment} from 'react'

const user = {
  name: 'Tom Cook',
  email: 'tom@example.com',
  imageUrl:
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
}

export const UserAccountNav = () => {
  const {currentUser, onSignout} = useAuth()

  return (
    <Menu as="div" className="relative ml-3">
      <div>
        <Menu.Button className="relative flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
          <span className="absolute -inset-1.5" />
          <span className="sr-only">Open user menu</span>
          <img
            className="h-8 w-8 rounded-full"
            src={currentUser?.photo ?? user.imageUrl}
            alt=""
          />
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
              Logged in as <strong>{currentUser?.name ?? user.name}</strong>
            </div>
          </Menu.Item>
          <Menu.Item>
            {({active}) => (
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
            {({active}) => (
              <button
                type="button"
                onClick={onSignout}
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
