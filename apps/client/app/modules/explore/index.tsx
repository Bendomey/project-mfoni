import { ExploreSection } from './components/section/index.tsx'
import { Footer } from '@/components/footer/index.tsx'
import { Header } from '@/components/layout/index.ts'

export const ExploreModule = () => {
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

				<div className="mt-10 space-y-10">
					{/* for featured tags */}
					<ExploreSection<Tag>
						isLoading
						type="TAG"
						title="Featured Tags"
						contents={[...new Array(30)]}
					/>

					<ExploreSection<Collection>
						isLoading
						type="COLLECTION"
						title="Featured Collections"
						seeMoreLink="/collections"
						contents={[]}
					/>
					<ExploreSection<EnhancedCreator>
						isLoading
						type="CREATOR"
						title="Featured creators"
						contents={[]}
					/>
					<ExploreSection<Content>
						isLoading
						type="CONTENT"
						title="Featured Photos"
						seeMoreLink="/collections/featured_contents"
						contents={[]}
					/>
					<ExploreSection<Collection>
						isLoading
						type="COLLECTION"
						title="Trending Collections"
						seeMoreLink="/collections"
						contents={[]}
					/>
					<ExploreSection<Tag>
						isLoading
						type="TAG"
						title="Popular tags"
						seeMoreLink="/tags"
						contents={[...new Array(30)]}
					/>
					<ExploreSection<EnhancedCreator>
						isLoading
						type="CREATOR"
						title="Your Followings"
						contents={[]}
					/>
				</div>
			</div>
			<Footer />
		</div>
	)
}
