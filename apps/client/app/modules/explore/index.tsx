import { useMemo, useRef } from 'react'
import { ExploreSection } from './components/section/index.tsx'
import { useGetExploreSections } from '@/api/explore/index.ts'
import { EmptyState } from '@/components/empty-state/index.tsx'
import { Footer } from '@/components/footer/index.tsx'
import { Header } from '@/components/layout/index.ts'
import { useAuth } from '@/providers/auth/index.tsx'

export const ExploreModule = () => {
	const { isLoggedIn } = useAuth()
	const containerRef = useRef<HTMLDivElement>(null)

	const { data: exploreSections } = useGetExploreSections({
		sorter: {
			sort: 'asc',
			sortBy: 'sort',
		},
		pagination: {
			page: 0,
			per: 50,
		},
	})

	const contents = useMemo(() => {
		return exploreSections?.rows?.map((section) => {
			if (section.ensureAuth && !isLoggedIn) return null

			// TODO: bring this back after the backend is ready.
			if (section.endpoint.includes('/followings')) return null

			return (
				<ExploreSection
					key={section.id}
					section={section as unknown as ExploreSection}
				/>
			)
		})
	}, [exploreSections?.rows, isLoggedIn])

	return (
		<div className="relative">
			<Header isHeroSearchInVisible={false} />
			<div className="max-w-8xl mx-auto px-4 py-4 lg:px-8">
				<div className="mt-5">
					<h1 className="text-4xl font-black">Explore mfoni contents</h1>
					<div className="mt-5">
						<p className="w-full text-zinc-600 md:w-2/4">
							mfoni offers millions of free, high-quality pictures. All pictures
							are free to download and use under the mfoni license.
						</p>
					</div>
				</div>

				{containerRef.current?.children?.length === 0 ? (
					<div className="my-28 space-y-10">
						<EmptyState title="No contents found" message="Come back later" />
					</div>
				) : null}

				<div ref={containerRef} className="mt-10 space-y-10">
					{contents}
				</div>
			</div>
			<Footer />
		</div>
	)
}
