import { Link } from '@remix-run/react'
import { FadeIn } from '@/components/animation/FadeIn.tsx'

import { SearchPhotos } from '@/components/layout/header/search/index.tsx'
import { SearchPhotosForMobile } from '@/components/layout/header/search-for-mobile/index.tsx'
import { Header } from '@/components/layout/index.ts'

export const HeroSection = () => {
	return (
		<div
			style={{
				backgroundImage: `url(/images/hero-bg.jpeg)`,
				backgroundRepeat: 'no-repeat',
				backgroundSize: 'cover',
				backgroundPosition: 'left',
			}}
			className="h-[60vh] bg-gradient-to-r from-sky-500 to-indigo-500"
		>
			<Header isHeroSearchInVisible={true} />
			<FadeIn className="px-6 pt-14 lg:px-8">
				<div className="mx-auto max-w-2xl">
					<div className="mb-5 flex">
						<div className="relative rounded-full px-3 py-1 text-xs leading-6 text-gray-600 ring-1 ring-gray-900/10 hover:ring-gray-900/20 md:text-sm">
							Announcing visual search feature.{' '}
							<Link
								prefetch="intent"
								to="/blog/visual-search"
								className="font-semibold text-blue-600"
							>
								<span className="absolute inset-0" aria-hidden="true" />
								Read more <span aria-hidden="true">&rarr;</span>
							</Link>
						</div>
					</div>
					<h1 className="text-2xl font-bold leading-8 tracking-tight text-gray-900 sm:text-5xl">
						The best photo gallery shared by creators in Ghana.
					</h1>{' '}
					<div className="mt-5 block md:hidden">
						<SearchPhotosForMobile />
					</div>
					<div className="mt-5 hidden md:block">
						<SearchPhotos isSittingOnADarkBackground />
					</div>
				</div>
			</FadeIn>
		</div>
	)
}
