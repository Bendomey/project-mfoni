import { yupResolver } from '@hookform/resolvers/yup'
import {
	Link,
	useLoaderData,
	useNavigate,
	useSearchParams,
} from '@remix-run/react'
import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import * as Yup from 'yup'
import { useCreateContentReportCase } from '@/api/reports/index.ts'
import { Button } from '@/components/button/index.tsx'
import { Footer } from '@/components/footer/index.tsx'
import { Header } from '@/components/layout/index.ts'
import { errorMessagesWrapper } from '@/constants/error-messages.ts'
import { PAGES } from '@/constants/index.ts'
import { classNames } from '@/lib/classNames.ts'
import { errorToast, successToast } from '@/lib/custom-toast-functions.tsx'
import { useAuth } from '@/providers/auth/index.tsx'
import { type loader } from '@/routes/report.contents._index.ts'

interface FormValues {
	name?: string
	phone?: string
	email?: string
	contentUrl: string
	reasonForReport: string
	breakingLocalLaws: 'YES' | 'NOT_SURE'
	additionalDetails?: string
}

const pathRegex = /(collections|photos|tags)\/[^/]+$/ // Accepted Path structure

export function ReportContentsModule() {
	const data = useLoaderData<typeof loader>()
	const { isLoggedIn } = useAuth()
	const navigate = useNavigate()
	const [searchParams] = useSearchParams()
	const { mutate, isPending } = useCreateContentReportCase()

	const fullRegex = useMemo(
		() =>
			new RegExp(
				`^${data.origin.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&')}/${
					pathRegex.source
				}`,
			),
		[data.origin],
	)

	const schema = useMemo(
		() =>
			Yup.object().shape({
				email: Yup.string().email('Email is invalid').optional(),
				phone: Yup.string()
					.min(10, 'Phone number must be 10 digits or more')
					.matches(/^[0-9]*$/, 'Phone number must be digits')
					.when([], {
						is: () => !isLoggedIn,
						then: (schema) => schema.required('Phone number is required'),
						otherwise: (schema) => schema,
					}),
				name: Yup.string().when([], {
					is: () => !isLoggedIn,
					then: (schema) => schema.required('Name is required'),
					otherwise: (schema) => schema,
				}),
				contentUrl: Yup.string()
					.matches(fullRegex, 'Invalid Content Url')
					.required('Content Url is required'),
				reasonForReport: Yup.string().required('Reason for report is required'),
				breakingLocalLaws: Yup.string()
					.oneOf(['YES', 'NOT_SURE'], 'Invalid selection')
					.default('NOT_SURE'),
				additionalDetails: Yup.string().when('reasonForReport', {
					is: (val: string) => val === 'OTHER',
					then: (schema) => schema.required('Additional details is required'),
					otherwise: (schema) => schema,
				}),
			}),
		[fullRegex, isLoggedIn],
	)

	const {
		register,
		handleSubmit,
		formState: { errors },
		setValue,
		watch,
	} = useForm<FormValues>({
		resolver: yupResolver(schema),
	})

	useEffect(() => {
		let contentUrl = ''
		let url = searchParams.get('content_url')
		if (url) {
			url = decodeURIComponent(url)
			contentUrl = url
		}

		setValue('contentUrl', contentUrl)
	}, [data.origin, searchParams, setValue])

	const contentUrl = watch('contentUrl')

	const contentType = useMemo(() => {
		if (!contentUrl) return ''
		if (contentUrl.includes('/photos')) {
			return 'Photo'
		}

		if (contentUrl.includes('/tags')) {
			return 'Tag'
		}

		if (contentUrl.includes('/collections')) {
			return 'Collection'
		}

		return ''
	}, [contentUrl])

	const onSubmit = (data: FormValues) => {
		const contentSlug = data.contentUrl.split('/')[4]
		if (!contentSlug) {
			errorToast('Invalid content 1', {
				id: 'create-content-report-error',
			})
			return
		}

		if (!['Photo', 'Tag', 'Collection'].includes(contentType)) {
			errorToast('Invalid content 2', {
				id: 'create-content-report-error',
			})
			return
		}

		const type =
			contentType === 'Photo'
				? 'IMAGE'
				: contentType === 'Collection'
					? 'COLLECTION'
					: 'TAG'

		mutate(
			{
				...data,
				contentSlug,
				contentType: type,
			},
			{
				onSuccess: async () => {
					successToast('Report submitted successfully', {
						id: 'create-content-report-success',
					})
					navigate(PAGES.HOME)
				},
				onError: (error) => {
					errorToast(errorMessagesWrapper(error.message), {
						id: 'create-content-report-error',
					})
				},
			},
		)
	}

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

				<form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
					<div className="rounded-lg border border-gray-200 px-5 py-7 md:px-10">
						<p className="font-bold">Content Information</p>
						<div className="mt-3">
							<label className="text-sm" htmlFor="content-url">
								URL of content you are reporting
							</label>
							<div className="mt-2">
								<input
									type="text"
									{...register('contentUrl')}
									className={classNames(
										'block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-1 focus:-outline-offset-1 focus:outline-blue-300 sm:text-sm/6',
										{
											'outline-red-500': errors.contentUrl,
										},
									)}
								/>
								<span className="text-xs text-red-600">
									{errors.contentUrl?.message}
								</span>
							</div>

							{contentType ? (
								<div className="mt-2">
									<span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1.5 text-sm font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
										{contentType}
									</span>
								</div>
							) : null}
						</div>
					</div>

					<div className="space-y-3 rounded-lg border border-gray-200 px-5 py-7 md:px-10">
						<div className="">
							<label className="text-sm">Reason for reporting content.</label>
							<div className="mt-2">
								<select
									{...register('reasonForReport')}
									className={classNames(
										'block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-1 focus:-outline-offset-1 focus:outline-blue-300 sm:text-sm/6',
										{
											'outline-red-500': errors.reasonForReport,
										},
									)}
								>
									<option value="">Please select</option>
									<option value="DATA_PROTECTION_AND_PRIVACY_VIOLATION">
										Data Protection and Privacy Violations
									</option>
									<option value="PORNOGRAPHY_AND_SEXUALIZED_CONTENT">
										Pornography and Sexualized Content
									</option>
									<option value="PROTECTION_OF_MINORS">
										Protection Of Minors
									</option>
									<option value="PUBLIC_SECURITY">
										Risk of Public Security
									</option>
									<option value="SCAMS_AND_FRAUD">Scams and Fraud</option>
									<option value="UNSAFE_AND_ILLEGAL">
										Unsafe and/or Illegal
									</option>
									<option value="VIOLENCE">Violence</option>
									<option value="OTHER">Other</option>
								</select>
								<span className="text-xs text-red-600">
									{errors.reasonForReport?.message}
								</span>
							</div>
						</div>

						<div className="">
							<label className="text-sm">
								Do you think this content violates a Ghanaian local law?
							</label>
							<div className="mt-2">
								<select
									{...register('breakingLocalLaws')}
									className={classNames(
										'block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-1 focus:-outline-offset-1 focus:outline-blue-300 sm:text-sm/6',
										{
											'outline-red-500': errors.breakingLocalLaws,
										},
									)}
								>
									<option value="">Please select</option>
									<option value="YES">Yes</option>
									<option value="NOT_SURE">Not Sure</option>
								</select>
								<span className="text-xs text-red-600">
									{errors.breakingLocalLaws?.message}
								</span>
							</div>
						</div>

						<div className="">
							<label className="text-sm">
								Give us additional details about this content.
							</label>
							<div className="mt-2">
								<textarea
									{...register('additionalDetails')}
									rows={5}
									placeholder="Add Details Here"
									className={classNames(
										'block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-1 focus:-outline-offset-1 focus:outline-blue-300 sm:text-sm/6',
										{
											'outline-red-500': errors.additionalDetails,
										},
									)}
								></textarea>
								<span className="text-xs text-red-600">
									{errors.additionalDetails?.message}
								</span>
							</div>
						</div>
					</div>

					{isLoggedIn ? null : (
						<div className="rounded-lg border border-gray-200 px-5 py-7 md:px-10">
							<p className="font-bold">Contact Information</p>
							<div className="mt-3">
								<label className="text-sm">Name</label>
								<div className="mt-2">
									<input
										type="text"
										{...register('name')}
										className={classNames(
											'block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-1 focus:-outline-offset-1 focus:outline-blue-300 sm:text-sm/6',
											{
												'outline-red-500': errors.name,
											},
										)}
									/>
									<span className="text-xs text-red-600">
										{errors.name?.message}
									</span>
								</div>
							</div>

							<div className="mt-3">
								<label className="text-sm" htmlFor="content-url">
									Phone Number
								</label>
								<div className="mt-2">
									<input
										{...register('phone')}
										type="text"
										className={classNames(
											'block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-1 focus:-outline-offset-1 focus:outline-blue-300 sm:text-sm/6',
											{
												'outline-red-500': errors.phone,
											},
										)}
									/>
									<p
										id="phone-description"
										className="mt-2 text-xs text-gray-500"
									>
										Not a Ghanaian number? Provide internationalized format
									</p>
									<span className="text-xs text-red-600">
										{errors.phone?.message}
									</span>
								</div>
							</div>

							<div className="mt-3">
								<label className="text-sm" htmlFor="content-url">
									Email
								</label>
								<div className="mt-2">
									<input
										{...register('email')}
										type="email"
										className={classNames(
											'block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-1 focus:-outline-offset-1 focus:outline-blue-300 sm:text-sm/6',
											{
												'outline-red-500': errors.email,
											},
										)}
									/>
									<span className="text-xs text-red-600">
										{errors.email?.message}
									</span>
								</div>
							</div>
						</div>
					)}

					<Button
						type="submit"
						disabled={isPending}
						className="w-full"
						size="lg"
					>
						{isPending ? 'Submitting...' : 'Submit Report'}
					</Button>
				</form>
			</div>
			<Footer />
		</>
	)
}
