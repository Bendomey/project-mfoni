import {
	MagnifyingGlassIcon,
	ArrowTrendingUpIcon,
	RectangleGroupIcon,
} from '@heroicons/react/24/outline'
import { Button } from '@/components/button/index.tsx'

export const TextSearch = () => {
	return (
		<div className="px-2">
			<div className="mt-2 flex flex-row items-center justify-between">
				<h1 className="text-xl font-bold md:text-lg">Recent Searches</h1>
				<Button
					variant="unstyled"
					className="text-sm text-zinc-400 hover:underline"
				>
					Clear
				</Button>
			</div>
			<div className="mt-4 flex flex-row flex-wrap items-center gap-3">
				{[
					'Nature',
					'People',
					'Food',
					'Animals',
					'Architecture',
					'Interiors',
					'Current Events',
					'Business & Work',
				].map((item, index) => (
					<Button size="sm" key={index} variant="outlined">
						<div className="font-base flex flex-row items-center text-gray-600">
							{' '}
							<MagnifyingGlassIcon className="mr-2 h-3 w-3" /> {item}
						</div>
					</Button>
				))}
			</div>

			<div className="mt-10 flex flex-row items-center justify-between">
				<h1 className="text-xl font-bold md:text-lg">
					🚀 Trending Collections
				</h1>
			</div>
			<div className="mt-4 flex flex-row flex-wrap items-center gap-3">
				{[
					'Nature',
					'People',
					'Food',
					'Animals',
					'Architecture',
					'Interiors',
					'Current Events',
					'Business & Work',
				].map((item, index) => (
					<Button size="sm" key={index} variant="outlined">
						<div className="flex flex-row items-center">
							{' '}
							<ArrowTrendingUpIcon className="mr-2 h-5 w-5" /> {item}
						</div>
					</Button>
				))}
			</div>

			<div className="mt-10 flex flex-row items-center justify-between">
				<h1 className="text-xl font-bold md:text-lg">Popular Tags 🔥</h1>
			</div>
			<div className="mt-4 flex flex-row flex-wrap items-center gap-3">
				{[
					'Nature',
					'People',
					'Food',
					'Animals',
					'Architecture',
					'Interiors',
					'Current Events',
					'Business & Work',
				].map((item, index) => (
					<Button key={index} variant="outlined">
						<div className="flex flex-row items-center">
							<RectangleGroupIcon className="mr-2 h-5 w-5" /> {item}
						</div>
					</Button>
				))}
			</div>
		</div>
	)
}
