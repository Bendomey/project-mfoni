import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { ShareIcon } from '@heroicons/react/16/solid'
import { LinkIcon } from '@heroicons/react/24/outline'
import { useMemo } from 'react'
import { Button, type ButtonProps } from '../button/index.tsx'
import { successToast } from '@/lib/custom-toast-functions.tsx'
import { isBrowser } from '@/lib/is-browser.ts'

interface Props {
	button?: any
	text?: string
	link?: string
	buttonProps?: ButtonProps
}

export function ShareButton({ button, link, text, buttonProps }: Props) {
	const resolvedText = text ?? 'Check this out'
	const resolvedLink = useMemo(() => {
		if (isBrowser) {
			return link ?? window.location.href
		}

		return link ?? ''
	}, [link])

	return (
		<Menu as="div" className="relative w-full">
			<div>
				<MenuButton className="w-full">
					{button ?? (
						<Button variant="outlined" {...buttonProps}>
							<ShareIcon className="mr-2 size-4 fill-current" />
							Share
						</Button>
					)}
				</MenuButton>
			</div>
			<MenuItems
				transition
				className="absolute right-0 z-10 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
			>
				<div className="py-1">
					<MenuItem>
						<Button
							onClick={() => {
								window.open(
									`https://www.facebook.com/sharer/sharer.php?u=${resolvedLink}&t=${resolvedText}`,
									'_blank',
								)
							}}
							variant="unstyled"
							className="group flex w-full items-center justify-start rounded-none px-4 py-2 text-xs font-medium text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900 data-[focus]:outline-none"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="mr-2 size-4"
								x="0px"
								y="0px"
								width="200"
								height="200"
								viewBox="0 0 24 24"
							>
								<path d="M 12 2 C 6.4889971 2 2 6.4889971 2 12 C 2 17.511003 6.4889971 22 12 22 C 17.511003 22 22 17.511003 22 12 C 22 6.4889971 17.511003 2 12 2 z M 12 4 C 16.430123 4 20 7.5698774 20 12 C 20 16.014467 17.065322 19.313017 13.21875 19.898438 L 13.21875 14.384766 L 15.546875 14.384766 L 15.912109 12.019531 L 13.21875 12.019531 L 13.21875 10.726562 C 13.21875 9.7435625 13.538984 8.8710938 14.458984 8.8710938 L 15.935547 8.8710938 L 15.935547 6.8066406 C 15.675547 6.7716406 15.126844 6.6953125 14.089844 6.6953125 C 11.923844 6.6953125 10.654297 7.8393125 10.654297 10.445312 L 10.654297 12.019531 L 8.4277344 12.019531 L 8.4277344 14.384766 L 10.654297 14.384766 L 10.654297 19.878906 C 6.8702905 19.240845 4 15.970237 4 12 C 4 7.5698774 7.5698774 4 12 4 z" />
							</svg>
							Facebook
						</Button>
					</MenuItem>
					<MenuItem>
						<Button
							onClick={() => {
								window.open(
									`https://twitter.com/intent/tweet?url=${resolvedLink}&text=${resolvedText}`,
									'_blank',
								)
							}}
							variant="unstyled"
							className="group flex w-full items-center justify-start rounded-none px-4 py-2 text-xs font-medium text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900 data-[focus]:outline-none"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="mr-2 size-4"
								x="0px"
								y="0px"
								width="100"
								height="100"
								viewBox="0 0 50 50"
							>
								<path d="M 5.9199219 6 L 20.582031 27.375 L 6.2304688 44 L 9.4101562 44 L 21.986328 29.421875 L 31.986328 44 L 44 44 L 28.681641 21.669922 L 42.199219 6 L 39.029297 6 L 27.275391 19.617188 L 17.933594 6 L 5.9199219 6 z M 9.7167969 8 L 16.880859 8 L 40.203125 42 L 33.039062 42 L 9.7167969 8 z" />
							</svg>
							Twitter
						</Button>
					</MenuItem>
					<MenuItem>
						<Button
							onClick={() => {
								navigator.share({
									title: 'mfoni',
									text: text,
									url: resolvedLink,
								})
							}}
							variant="unstyled"
							className="group flex w-full items-center justify-start rounded-none px-4 py-2 text-xs font-medium text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900 data-[focus]:outline-none"
						>
							<ShareIcon
								aria-hidden="true"
								className="mr-2 size-4 text-gray-400 group-data-[focus]:text-gray-500"
							/>
							Share via...
						</Button>
					</MenuItem>
				</div>
				<div className="py-1">
					<MenuItem>
						<Button
							onClick={async () => {
								await navigator.clipboard.writeText(
									`${resolvedText}: ${resolvedLink}`,
								)
								successToast('Link copied to clipboard')
							}}
							variant="unstyled"
							className="group flex w-full items-center justify-start rounded-none px-4 py-2 text-xs font-medium text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900 data-[focus]:outline-none"
						>
							<LinkIcon
								aria-hidden="true"
								className="mr-2 size-4 text-gray-400 group-data-[focus]:text-gray-500"
							/>
							Copy Link
						</Button>
					</MenuItem>
				</div>
			</MenuItems>
		</Menu>
	)
}
