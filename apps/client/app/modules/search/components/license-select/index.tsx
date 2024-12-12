import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import {
	BanknotesIcon,
	CheckIcon,
	ChevronDownIcon,
} from '@heroicons/react/24/outline'
import { Button } from '@/components/button/index.tsx'

export function FilterByLicense() {
	return (
		<Menu as="div" className="relative">
			<div>
				<MenuButton>
					<Button
						size="md"
						variant="outlined"
						className="rounded-[5px] text-gray-400"
					>
						<BanknotesIcon className="mr-1 size-4 fill-current" />
						<span className="">License</span>

						<div className="ml-2 flex items-center">
							<span className="text-gray-600">All</span>
							<ChevronDownIcon className="ml-1 size-4" />
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
							className="group flex w-full items-center justify-start rounded-none px-4 py-2 text-xs font-medium text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900 data-[focus]:outline-none"
						>
							<CheckIcon className="mr-3 size-4" />
							All
						</Button>
					</MenuItem>
					<MenuItem>
						<Button
							variant="unstyled"
							className="group flex w-full items-center justify-start rounded-none px-4 py-2 text-xs font-medium text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900 data-[focus]:outline-none"
						>
							Free
						</Button>
					</MenuItem>
					<MenuItem>
						<Button
							variant="unstyled"
							className="group flex w-full items-center justify-start rounded-none px-4 py-2 text-xs font-medium text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900 data-[focus]:outline-none"
						>
							mfoni +
						</Button>
					</MenuItem>
				</div>
			</MenuItems>
		</Menu>
	)
}
