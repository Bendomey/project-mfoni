import { Link } from '@remix-run/react'
import { Button } from '@/components/button/index.tsx'
import { Footer } from '@/components/footer/index.tsx'
import { Header } from '@/components/layout/index.ts'
import { classNames } from '@/lib/classNames.ts'

export function ReportContentsModule() {
	return (
		<>
			<Header isHeroSearchInVisible={false} />
			<div className="max-w-8xl mx-auto w-full px-4 md:w-2/3 lg:px-8">
				<div className="py-5">
					<h1 className="text-center text-3xl font-bold">
						Report Content Form
					</h1>
				</div>
				<p className="text-center font-medium">
					Use this form to report content you believe to be illegal in Ghana.
					Please provide as much detail as possible to help us review and
					address your report efficiently.
				</p>

				<div className="mt-5">
					<p className="text-center font-medium">
						<Link
							to="/blog/report-contents"
							className="border-b-2 border-dashed pb-0.5 text-blue-600"
						>
							Learn more
						</Link>{' '}
						about reporting content.
					</p>
				</div>

				<div className="mt-8 space-y-5">
					<div className="rounded-lg border border-gray-200 px-5 py-7 md:px-10">
						<p className="font-bold">Content Information</p>
						<div className="mt-3">
							<label className="text-sm" htmlFor="content-url">
								URL of content you are reporting
							</label>
							<div className="mt-2">
								<input
									name="content-url"
									type="text"
									className={classNames(
										'block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-1 focus:-outline-offset-1 focus:outline-blue-300 sm:text-sm/6',
									)}
								/>
							</div>
						</div>
					</div>

					<div className="space-y-3 rounded-lg border border-gray-200 px-5 py-7 md:px-10">
						<div className="">
							<label className="text-sm" htmlFor="content-url">
								Reason for reporting content.
							</label>
							<div className="mt-2">
								<select
									name="content-url"
									className={classNames(
										'block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-1 focus:-outline-offset-1 focus:outline-blue-300 sm:text-sm/6',
									)}
								>
									<option value="">Please select</option>
									<option value="">
										Data Protection and Privacy Violations
									</option>
									<option value="">Pornography and Sexualized Content</option>
									<option value="">Protection Of Minors</option>
									<option value="">Risk of Public Security</option>
									<option value="">Scams and Fraud</option>
									<option value="">Unsafe and/or Illegal</option>
									<option value="">Violence</option>
									<option value="">Other</option>
								</select>
							</div>
						</div>

						<div className="">
							<label className="text-sm" htmlFor="content-url">
								Do you think this content violates a Ghanaian local law?
							</label>
							<div className="mt-2">
								<select
									name="content-url"
									className={classNames(
										'block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-1 focus:-outline-offset-1 focus:outline-blue-300 sm:text-sm/6',
									)}
								>
									<option value="">Please select</option>
									<option value="yes">Yes</option>
									<option value="not_sure">Not Sure</option>
								</select>
							</div>
						</div>

						<div className="">
							<label className="text-sm" htmlFor="content-url">
								Give us additional details about this content.
							</label>
							<div className="mt-2">
								<textarea
									name="content-url"
									rows={5}
									placeholder="Add Details Here"
									className={classNames(
										'block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-1 focus:-outline-offset-1 focus:outline-blue-300 sm:text-sm/6',
									)}
								></textarea>
							</div>
						</div>
					</div>

					<div className="rounded-lg border border-gray-200 px-5 py-7 md:px-10">
						<p className="font-bold">Contact Information</p>
						<div className="mt-3">
							<label className="text-sm" htmlFor="content-url">
								Name
							</label>
							<div className="mt-2">
								<input
									name="name"
									type="text"
									className={classNames(
										'block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-1 focus:-outline-offset-1 focus:outline-blue-300 sm:text-sm/6',
									)}
								/>
							</div>
						</div>

						<div className="mt-3">
							<label className="text-sm" htmlFor="content-url">
								Phone Number
							</label>
							<div className="mt-2">
								<input
									name="phone"
									type="text"
									className={classNames(
										'block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-1 focus:-outline-offset-1 focus:outline-blue-300 sm:text-sm/6',
									)}
								/>
								<p
									id="phone-description"
									className="mt-2 text-xs text-gray-500"
								>
									Not a Ghanaian number? Provide internationalized format
								</p>
							</div>
						</div>

						<div className="mt-3">
							<label className="text-sm" htmlFor="content-url">
								Email
							</label>
							<div className="mt-2">
								<input
									name="email"
									type="email"
									className={classNames(
										'block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-1 focus:-outline-offset-1 focus:outline-blue-300 sm:text-sm/6',
									)}
								/>
							</div>
						</div>
					</div>

					<Button disabled className="w-full" size="lg">
						Submit
					</Button>
				</div>
			</div>
			<Footer />
		</>
	)
}
