import { XMarkIcon } from '@heroicons/react/20/solid'
import cookiesImage from '@/assets/cookies.png'
import { Button } from '@/components/button/index.tsx'

interface Props {
	onClose: () => void
}

export function CookiesPolicyBanner({ onClose }: Props) {
	return (
		<div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 sm:flex sm:justify-center sm:px-6 sm:pb-5 lg:px-8">
			<div className="pointer-events-auto bg-blue-600 px-6 py-4 sm:rounded-xl sm:px-6 sm:py-6">
				<div className="flex items-center justify-between gap-x-6">
					<p className="items-center text-lg text-white md:flex">
						<img
							src={cookiesImage}
							height={25}
							width={25}
							className="mr-3 hidden sm:block"
						/>
						<strong className="font-semibold">
							mfoni, {new Date().getFullYear()}
						</strong>
						<svg
							viewBox="0 0 2 2"
							aria-hidden="true"
							className="mx-2 inline size-0.5 fill-current"
						>
							<circle r={1} cx={1} cy={1} />
						</svg>
						We use cookies to provide you with a great user experience.
					</p>
					<button
						onClick={onClose}
						type="button"
						className="-m-1.5 hidden flex-none p-1.5 md:block"
					>
						<span className="sr-only">Dismiss</span>
						<XMarkIcon aria-hidden="true" className="size-5 text-white" />
					</button>
				</div>
				<div className="mt-2 block md:hidden">
					<Button onClick={onClose} size="sm" variant="outlined">
						Close
					</Button>
				</div>
			</div>
		</div>
	)
}
