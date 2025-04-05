import { Fragment } from 'react'
import { useGetRelatedContents } from '@/api/contents/index.ts'
import { FadeIn, FadeInStagger } from '@/components/animation/FadeIn.tsx'
import { Content } from '@/components/Content/index.tsx'

interface Props {
	contentId: string
}

export function RelatedContent({ contentId }: Props) {
	const { data, isError, isPending } = useGetRelatedContents({
		contentId,
		query: {
			pagination: {
				page: 0,
				per: 50,
			},
			populate: ['content.createdBy']
		},
	})

	let content = <></>

	if (isPending) {
		content = (
			<div className="columns-1 gap-8 sm:columns-2 sm:gap-4 md:columns-3 my-10">
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

	if (isError || !data?.total) {
		return <></>
	}

	if (data?.total) {
		content = (
			<FadeInStagger faster>
				<div className="columns-1 gap-2 sm:columns-2 sm:gap-4 md:columns-3">
					{data.rows.map((content) => (
						<Fragment key={content.id}>
							{
								<div className="mb-5">
									<FadeIn>
										<Content content={content} />
									</FadeIn>
								</div>
							}
						</Fragment>
					))}
				</div>
			</FadeInStagger>
		)
	}

	return (
		<div className="mt-10">
			<div className='px-4 md:px-0'>
				<h1 className="text-2xl font-bold">Related Images</h1>
			</div>

			<div className="mt-5">{content}</div>
		</div>
	)
}
