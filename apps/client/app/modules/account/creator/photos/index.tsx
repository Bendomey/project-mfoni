import { Content } from '@/components/Content/index.tsx'
import { imageUrls } from '@/modules/landing-page/index.tsx'

export function CreatorPhotosModule() {
	return (
		<div className="columns-1 gap-2 sm:columns-2 sm:gap-4 md:columns-2 lg:columns-3 [&>img:not(:first-child)]:mt-8">
			{imageUrls.map((url, index) => (
				<div className="mb-5" key={index}>
					<Content content={{ media: { url } } as any} />
				</div>
			))}
		</div>
	)
}
