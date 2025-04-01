import * as outline from '@heroicons/react/24/outline'
import { useNavigate } from '@remix-run/react'
import { useMediaQuery } from '@uidotdev/usehooks'
import { useGetCollections } from '@/api/collections/index.ts'
import { Button } from '@/components/button/index.tsx'
import { PAGES } from '@/constants/index.ts'

export type ISearchContext = 'all' | 'collections' | 'creators' | 'photos'

interface Props {
	onCloseModal: () => void
}

export function TrendingCollections({ onCloseModal }: Props) {
	const { data, isPending, isError } = useGetCollections({
		pagination: { page: 0, per: 10 },
		filters: { visibility: 'PUBLIC' },
	})
	const isSmallDevice = useMediaQuery('only screen and (max-width : 768px)')

	const navigate = useNavigate()

	let content = <></>
	if (isPending) {
		content = (
			<>
				{[...new Array(isSmallDevice ? 5 : 10)].map((_, index) => {
					return (
						<div
							key={index}
							className="h-8 w-24 animate-pulse rounded-md border-gray-100 bg-gray-100"
						/>
					)
				})}
			</>
		)
	}

	if ((data && !data?.total) || isError) {
		return null
	}

	if (data?.total) {
		content = (
			<>
				{data.rows.map((item, index) => {
					return (
						<Button
							onClick={() => {
								navigate(PAGES.COLLECTION.replace(':collection', item.slug))
								onCloseModal()
							}}
							size={isSmallDevice ? 'sm' : undefined}
							key={index}
							variant="outlined"
						>
							<div className="font-base flex flex-row items-center text-gray-600">
								<outline.RectangleGroupIcon className="mr-2 h-5 w-5" />{' '}
								{item.name}
							</div>
						</Button>
					)
				})}
			</>
		)
	}

	return (
		<div className="mt-5">
			<div className="flex flex-row items-center justify-between">
				<h1 className="text-base font-bold md:text-lg">
					🚀 Trending Collections
				</h1>
			</div>
			<div className="mt-4 flex flex-row flex-wrap items-center gap-3">
				{content}
			</div>
		</div>
	)
}
