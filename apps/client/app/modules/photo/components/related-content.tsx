import { Fragment } from 'react'
import { FadeIn, FadeInStagger } from '@/components/animation/FadeIn.tsx'
import { Content } from '@/components/Content/index.tsx'
import { imageUrls } from '@/modules/landing-page/index.tsx'

export function RelatedContent() {
	return (
		<div>
			<h1 className="text-2xl font-bold">Related Images</h1>

			<div className="mt-5">
				<FadeInStagger faster>
					<div className="columns-1 gap-2 sm:columns-2 sm:gap-4 md:columns-2 lg:columns-3 [&>img:not(:first-child)]:mt-8">
						{imageUrls.map((url, index) => (
							<Fragment key={index}>
								<FadeIn>
									<Content content={{ media: { url } } as any} />
								</FadeIn>
							</Fragment>
						))}
					</div>
				</FadeInStagger>
			</div>
		</div>
	)
}
