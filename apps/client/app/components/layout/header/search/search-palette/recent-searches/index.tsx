import { MagnifyingGlassIcon } from '@heroicons/react/20/solid'
import { useNavigate } from '@remix-run/react'
import { useLocalStorage, useMediaQuery } from '@uidotdev/usehooks'
import { Button } from '@/components/button/index.tsx'
import { RECENT_SEARCHES_KEY } from '@/constants/index.ts'

export type ISearchContext = 'all' | 'collections' | 'creators' | 'photos'

interface Props {
	onCloseModal: () => void
}

export function RecentSearches({ onCloseModal }: Props) {
	const navigate = useNavigate()
	const [recentSearches, setRecentSearches] = useLocalStorage<
		Array<{ context: ISearchContext; query: string }>
	>(RECENT_SEARCHES_KEY, [])
	const isSmallDevice = useMediaQuery('only screen and (max-width : 768px)')

	if (recentSearches.length === 0) {
		return null
	}

	return (
		<div>
			<div className="flex flex-row items-center justify-between">
				<h1 className="text-base font-bold md:text-lg">Recent Searches</h1>
				<Button
					onClick={() => setRecentSearches([])}
					variant="unstyled"
					className="text-sm text-zinc-400 hover:underline"
				>
					Clear
				</Button>
			</div>
			<div className="mt-4 flex flex-row flex-wrap items-center gap-3">
				{recentSearches.map((item, index) => {
					let url = '/search'
					if (item.context === 'collections') {
						url += '/collections'
					} else if (item.context === 'creators') {
						url += '/creators'
					} else {
						url += '/photos'
					}

					return (
						<Button
							onClick={() => {
								navigate(`${url}/${item.query}`)
								onCloseModal()
							}}
							size={isSmallDevice ? 'sm' : undefined}
							key={index}
							variant="outlined"
						>
							<div className="font-base flex flex-row items-center text-gray-600">
								{' '}
								<MagnifyingGlassIcon className="mr-2 h-3 w-3" /> {item.query}
							</div>
						</Button>
					)
				})}
			</div>
		</div>
	)
}
