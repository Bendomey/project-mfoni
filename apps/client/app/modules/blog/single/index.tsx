import { ArrowLeftIcon } from '@heroicons/react/24/solid'
import { useLoaderData, useNavigate } from '@remix-run/react'
import dayjs from 'dayjs'
import { getMDXComponent } from 'mdx-bundler/client'
import { useMemo } from 'react'
import { Footer } from '@/components/footer/index.tsx'
import { Header } from '@/components/layout/index.ts'
import { classNames } from '@/lib/classNames.ts'
import { type loader } from '@/routes/blog.$slug.ts'

export function SingleBlogModule() {
	const { code, frontmatter } = useLoaderData<typeof loader>()
	const Component = useMemo(() => getMDXComponent(code), [code])
	const navigate = useNavigate()

	return (
		<>
			<Header isHeroSearchInVisible={false} />
			<div className="max-w-8xl mx-auto flex flex-col items-start gap-x-20 gap-y-5 px-4 py-4 md:flex-row lg:px-8">
				<button
					type="button"
					onClick={() => navigate(-1)}
					className="flex items-center justify-center rounded-full bg-white p-3 shadow-md shadow-gray-800/5 ring-1 ring-gray-900/5"
				>
					<ArrowLeftIcon className="h-4 w-4 text-gray-400 hover:text-gray-500" />
				</button>
				<article className="prose">
					<header className="flex flex-col">
						<time
							dateTime={frontmatter.date}
							className="order-first flex items-center text-base text-gray-400 dark:text-gray-500"
						>
							<span className="h-4 w-0.5 rounded-full bg-gray-200 dark:bg-gray-500" />
							<span className="ml-3">
								{dayjs(new Date(frontmatter.date)).format('LL')}
							</span>
						</time>
						<h1 className="mt-6 text-2xl font-bold tracking-tight text-black sm:text-3xl">
							{frontmatter.title}
						</h1>
					</header>
					<Component
						components={{
							img: (props) => (
								<img
									{...props}
									className={classNames(props.className, 'rounded-xl')}
								/>
							),
						}}
					/>
				</article>
			</div>
			<Footer />
		</>
	)
}
