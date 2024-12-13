import { useState } from 'react'
import { useInView } from 'react-intersection-observer'
import { imageUrls } from '../landing-page/index.tsx'
import { ExploreHeroSection } from './components/hero/index.tsx'
import { MobileTabComponent } from './components/tabs/mobile.tsx'
import { WebTabComponent } from './components/tabs/web.tsx'
import { FadeIn, FadeInStagger } from '@/components/animation/FadeIn.tsx'
import { Content } from '@/components/Content/index.tsx'
import { EmptyState } from '@/components/empty-state/index.tsx'
import { Footer } from '@/components/footer/index.tsx'
import { Header } from '@/components/layout/index.ts'

export const ExploreModule = () => {
	const { ref: heroRef, inView } = useInView({
		threshold: 0,
	})

	const [empty] = useState(false)

	return (
		<div className="relative">
			<div ref={heroRef}>
				<ExploreHeroSection />
			</div>
			{inView ? null : <Header isHeroSearchInVisible={false} />}
			<div className="mx-auto my-2 grid max-w-7xl grid-cols-1 gap-8 px-3 sm:px-3 md:px-8 lg:my-16 lg:grid-cols-4">
				{/* web */}
				<div className="lg:col-span-1">
					<WebTabComponent />
				</div>
				{/* mobile */}
				<div className="col-span-1 lg:hidden">
					<MobileTabComponent />
				</div>
				{empty ? (
					<EmptyState
						message="It seems like the category currently has no items for."
						title="Detty December"
					/>
				) : (
					<div className="col-span-1 lg:col-span-3">
						<FadeInStagger faster>
							<div className="columns-1 gap-2 sm:columns-2 sm:gap-4 md:columns-2 lg:columns-3 [&>img:not(:first-child)]:mt-8">
								{imageUrls.map((url, index) => (
									<div className="mb-5" key={index}>
										<FadeIn>
											<Content content={{ media: { url } } as any} />
										</FadeIn>
									</div>
								))}
							</div>
						</FadeInStagger>
					</div>
				)}
			</div>
			<Footer />
		</div>
	)
}
