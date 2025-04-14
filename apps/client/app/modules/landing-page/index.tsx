import { useInView } from 'react-intersection-observer'
import { HeroSection } from './components/hero-section/index.tsx'
import { Pricing } from './components/pricing/index.tsx'
import { useGetContents } from '@/api/contents/index.ts'
import { Button } from '@/components/button/index.tsx'
import { Content } from '@/components/Content/index.tsx'
import { Footer } from '@/components/footer/index.tsx'
import { Header } from '@/components/layout/index.ts'
import { PAGES } from '@/constants/index.ts'

export const LandingPageModule = () => {
	const { ref: heroRef, inView } = useInView({
		threshold: 0,
	})

	const { data, isPending } = useGetContents({
		query: {
			pagination: { page: 0, per: 20 },
			filters: {
				// is_featured: true,
			},
			populate: ['content.createdBy'],
		},
	})

	let content = <></>

	if (isPending) {
		content = (
			<div className="columns-1 gap-8 sm:columns-2 sm:gap-4 md:columns-3">
				<div className="mb-5 h-96 w-full animate-pulse break-inside-avoid rounded-sm bg-gray-100" />
				<div className="mb-5 h-96 w-full animate-pulse break-inside-avoid rounded-sm bg-gray-100" />
				<div className="mb-5 h-60 w-full animate-pulse break-inside-avoid rounded-sm bg-gray-100" />
				<div className="mb-5 h-56 w-full animate-pulse break-inside-avoid rounded-sm bg-gray-100" />
				<div className="mb-5 h-60 w-full animate-pulse break-inside-avoid rounded-sm bg-gray-100" />
				<div className="mb-5 h-96 w-full animate-pulse break-inside-avoid rounded-sm bg-gray-100" />
				<div className="mb-5 h-60 w-full animate-pulse break-inside-avoid rounded-sm bg-gray-100" />
				<div className="mb-5 h-56 w-full animate-pulse break-inside-avoid rounded-sm bg-gray-100" />
				<div className="mb-5 h-56 w-full animate-pulse break-inside-avoid rounded-sm bg-gray-100" />
				<div className="mb-5 h-60 w-full animate-pulse break-inside-avoid rounded-sm bg-gray-100" />
			</div>
		)
	}

	if (data?.total) {
		content = (
			<>
				<div className="columns-1 gap-2 sm:columns-2 sm:gap-4 md:columns-3">
					{data.rows.map((content) => (
						<div className="mb-7 md:mb-5" key={content.id}>
							<Content content={content} />
						</div>
					))}
				</div>

				<div className="mt-10 flex justify-center">
					<Button
						isLink
						href={PAGES.CONTENTS}
						variant="solid"
						color="secondaryGhost"
						size="xl"
					>
						See More Contents
					</Button>
				</div>
			</>
		)
	}

	return (
		<div className="">
			<div ref={heroRef}>
				<HeroSection />
			</div>
			{inView ? null : <Header isHeroSearchInVisible={false} />}
			<div className="max-w-8xl mx-auto mb-5 mt-5 items-center px-0 md:px-5">
				{content}
				<Pricing />
			</div>
			<Footer />
		</div>
	)
}
