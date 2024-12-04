import {Button} from '@/components/button/index.tsx'
import {Menu, MenuButton, MenuItem, MenuItems} from '@headlessui/react'
import {
  BanknotesIcon,
  CheckIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline'

export function FilterByLicense() {
  return (
    <Menu as="div" className="relative">
      <div>
        <MenuButton>
          <Button
            size="md"
            variant="outlined"
            className="text-gray-400 rounded-[5px]"
          >
            <BanknotesIcon className="size-4 fill-current mr-1" />
            <span className="">License</span>

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
              All
            </Button>
          </MenuItem>
          <MenuItem>
            <Button
              variant="unstyled"
              className="group w-full flex justify-start rounded-none items-center px-4 py-2 text-xs font-medium text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900 data-[focus]:outline-none"
            >
              Free
            </Button>
          </MenuItem>
          <MenuItem>
            <Button
              variant="unstyled"
              className="group w-full flex justify-start rounded-none items-center px-4 py-2 text-xs font-medium text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900 data-[focus]:outline-none"
            >
              mfoni +
            </Button>
          </MenuItem>
        </div>
      </MenuItems>
    </Menu>
  )
}
