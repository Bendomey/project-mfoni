import { Fragment } from 'react'
import { useGetRelatedContents } from '@/api/contents/index.ts'
import { FadeIn, FadeInStagger } from '@/components/animation/FadeIn.tsx'
import { Content } from '@/components/Content/index.tsx'
import { Loader } from '@/components/loader/index.tsx'

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
		},
	})

	let content = <></>

	if (isPending) {
		content = (
			<div className="my-16 flex justify-center">
				<Loader />
			</div>
		)
	}

	if (isError || !data?.total) {
		return <></>
	}

	if (data?.total) {
		content = (
			<FadeInStagger faster>
				<div className="columns-1 gap-2 sm:columns-2 sm:gap-4 md:columns-2 lg:columns-3 [&>img:not(:first-child)]:mt-8">
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
			<h1 className="text-2xl font-bold">Related Images</h1>

			<div className="mt-5">{content}</div>
		</div>
	)
}
