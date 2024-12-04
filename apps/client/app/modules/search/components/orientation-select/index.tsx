import {Button} from '@/components/button/index.tsx'
import {Menu, MenuButton, MenuItem, MenuItems} from '@headlessui/react'
import {CheckIcon, ChevronDownIcon} from '@heroicons/react/24/outline'

export function FilterByOrientation() {
  return (
    <Menu as="div" className="relative">
      <div>
        <MenuButton>
          <Button
            size="md"
            variant="outlined"
            className="text-gray-400 rounded-[5px]"
          >
            <svg
              className="size-4 fill-current mr-1"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              version="1.1"
              aria-hidden="false"
            >
              <desc lang="en-US">Grid outlined</desc>
              <path d="M9 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h4c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h4v14zm10-7h-4c-1.1 0-2 .9-2 2v5c0 1.1.9 2 2 2h4c1.1 0 2-.9 2-2v-5c0-1.1-.9-2-2-2zm0 7h-4v-5h4v5zm0-16h-4c-1.1 0-2 .9-2 2v3c0 1.1.9 2 2 2h4c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 5h-4V5h4v3z" />
            </svg>
            <span className="">Orientation</span>

            <div className="flex items-center ml-2">
              <span className="text-gray-600 ">All</span>
              <ChevronDownIcon className="size-4 ml-1" />
            </div>
          </Button>
        </MenuButton>
      </div>
      <MenuItems
        transition
        className="absolute right-0 z-10 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
      >
        <div className="py-1">
          <MenuItem>
            <Button
              variant="unstyled"
              className="group w-full flex justify-start rounded-none items-center px-4 py-2 text-xs font-medium text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900 data-[focus]:outline-none"
            >
              <CheckIcon className="size-4 mr-3" />
              <svg
                className="size-4 fill-current mr-1"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                version="1.1"
                aria-hidden="false"
              >
                <desc lang="en-US">Grid outlined</desc>
                <path d="M9 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h4c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h4v14zm10-7h-4c-1.1 0-2 .9-2 2v5c0 1.1.9 2 2 2h4c1.1 0 2-.9 2-2v-5c0-1.1-.9-2-2-2zm0 7h-4v-5h4v5zm0-16h-4c-1.1 0-2 .9-2 2v3c0 1.1.9 2 2 2h4c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 5h-4V5h4v3z" />
              </svg>
              All
            </Button>
          </MenuItem>
          <MenuItem>
            <Button
              variant="unstyled"
              className="group w-full flex justify-start rounded-none items-center px-4 py-2 text-xs font-medium text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900 data-[focus]:outline-none"
            >
              <svg
                className="size-4 fill-current mr-1"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                version="1.1"
                aria-hidden="false"
              >
                <desc lang="en-US">Grid landscape outlined</desc>
                <path d="M19 5H5c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 12H5V7h14v10z" />
              </svg>
              Landscape
            </Button>
          </MenuItem>
          <MenuItem>
            <Button
              variant="unstyled"
              className="group w-full flex justify-start rounded-none items-center px-4 py-2 text-xs font-medium text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900 data-[focus]:outline-none"
            >
              <svg
                className="size-4 fill-current mr-1"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                version="1.1"
                aria-hidden="false"
              >
                <desc lang="en-US">Grid portrait outlined</desc>
                <path d="M17 3H7c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H7V5h10v14z" />
              </svg>
              Portrait
            </Button>
          </MenuItem>
        </div>
      </MenuItems>
    </Menu>
  )
}
