/* eslint-disable no-negated-condition */
import {Button} from '@/components/button/index.tsx'
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  ViewfinderCircleIcon,
} from '@heroicons/react/24/outline'
import {Fragment, useState} from 'react'
import {TextSearch} from './text/index.tsx'
import {VisualSearch} from './visual/index.tsx'
import {Transition, Popover} from '@headlessui/react'

interface Props {
  isSittingOnADarkBackground?: true
}

export const SearchPhotos = ({isSittingOnADarkBackground}: Props) => {
  const [query, setQuery] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)

  return (
    <div
      className={`relative focus:ring-0 block hover:border border-transparent border-zinc-300  w-full rounded-full  ${
        isSearchFocused || isSittingOnADarkBackground
          ? 'bg-white  border '
          : 'bg-zinc-100 '
      }`}
    >
      <div className="flex flex-row items-center">
        <div className="pointer-events-none  inset-y-0 left-0 flex items-center pl-5">
          <MagnifyingGlassIcon
            className="h-5 w-5 text-gray-600"
            aria-hidden="true"
          />
        </div>
        <div className="flex-grow">
          <input
            type="text"
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full focus:ring-0 bg-transparent border-none placeholder:text-gray-500 text-gray-900 py-2.5"
            placeholder="Search for photos"
          />
          <Transition
            as={Fragment}
            show={isSearchFocused}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <div className="absolute left-2 p-2 top-full z-40 mt-2 w-[45vw] overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-gray-900/5">
              <TextSearch />
            </div>
          </Transition>
        </div>

        <div className="inset-y-0 right-0 flex items-center pr-6">
          {query.length ? (
            <Button
              variant="unstyled"
              type="button"
              onClick={() => setQuery('')}
              externalClassName="border-r border-zinc-400 mr-4 pr-4"
            >
              <XMarkIcon
                className="h-5 w-5 text-gray-600 cursor-pointer"
                aria-hidden="true"
              />
            </Button>
          ) : null}
          <Popover className="relative">
            <Popover.Button className="flex items-center gap-x-1 text-sm font-semibold leading-6 ring-0 outline-none text-gray-900">
              <ViewfinderCircleIcon
                className="h-5 w-5 text-gray-600 cursor-pointer"
                aria-hidden="true"
              />
            </Popover.Button>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-1"
            >
              <Popover.Panel className="absolute right-1 top-full z-10 mt-5 p-3 w-screen max-w-md overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-gray-900/5">
                <VisualSearch />
              </Popover.Panel>
            </Transition>
          </Popover>
        </div>
      </div>
    </div>
  )
}
