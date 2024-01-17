import {Transition} from '@headlessui/react'
import {Fragment} from 'react'

type Props = {
  show: boolean
}

const activeOption = {
  id: 1,
  name: 'Leslie Alexander',
  phone: '1 (493) 747 9031',
  email: 'leslie@example.com',
  role: 'Accra, Ghana',
  url: 'https://example.com',
  profileUrl: '#',
  imageUrl:
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
}

export const PhotographerCreatorCard = ({show}: Props) => {
  return (
    <Transition
      as={Fragment}
      show={show}
      enter="transition ease-out duration-200"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition ease-in duration-150"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div className="absolute z-50 inset-x-0 top-0 -mt-8  bg-white/60 backdrop-blur-xl pb-4 shadow-xl sm:px-2 lg:left-auto lg:right-12 lg:top-full lg:-mr-1.5 lg:mt-3 lg:w-80 lg:rounded-lg lg:ring-0 lg:ring-opacity-5">
        <h2 className="sr-only">Creator</h2>
        <div className="hidden flex-none flex-col divide-y divide-gray-50 overflow-y-auto sm:flex">
          <div className="flex flex-row p-4 space-x-4 items-center justify-start">
            <img
              src={activeOption.imageUrl}
              alt=""
              className="h-12 w-12 rounded-full"
            />
            <div>
              <h2 className="mt-1 font-semibold text-gray-900">
                {activeOption.name}
              </h2>
              <p className="text-sm leading-6 text-gray-500">
                {activeOption.role}
              </p>
            </div>
          </div>
          <div className="flex flex-auto flex-col justify-between p-5">
            <dl className="grid grid-cols-1 gap-x-6 gap-y-2 text-sm text-gray-700">
              <dt className="col-end-1 font-semibold text-gray-900">Phone</dt>
              <dd>{activeOption.phone}</dd>
              <dt className="col-end-1 font-semibold text-gray-900">Email</dt>
              <dd className="truncate">
                <a
                  href={`mailto:${activeOption.email}`}
                  className="text-blue-600 underline"
                >
                  {activeOption.email}
                </a>
              </dd>
            </dl>
            <button
              type="button"
              className="mt-6 w-full rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              View Profile
            </button>
          </div>
        </div>
      </div>
    </Transition>
  )
}
