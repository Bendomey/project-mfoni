import { CheckCircleIcon } from '@heroicons/react/24/solid'
import { Image } from 'remix-image'
import { classNames } from '@/lib/classNames.ts'

const activity = [
	{
		id: 1,
		type: 'created',
		person: { name: 'Chelsea Hagon' },
		date: '7d ago',
		dateTime: '2023-01-23T10:32',
	},
	{
		id: 2,
		type: 'edited',
		person: { name: 'Chelsea Hagon' },
		date: '6d ago',
		dateTime: '2023-01-23T11:03',
	},
	{
		id: 3,
		type: 'sent',
		person: { name: 'Chelsea Hagon' },
		date: '6d ago',
		dateTime: '2023-01-23T11:24',
	},
	{
		id: 4,
		type: 'commented',
		person: {
			name: 'Chelsea Hagon',
			imageUrl:
				'https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
		},
		comment:
			'Called client, they reassured me the invoice would be paid by the 25th.',
		date: '3d ago',
		dateTime: '2023-01-23T15:56',
	},
	{
		id: 5,
		type: 'viewed',
		person: { name: 'Alex Curren' },
		date: '2d ago',
		dateTime: '2023-01-24T09:12',
	},
	{
		id: 6,
		type: 'paid',
		person: { name: 'Alex Curren' },
		date: '1d ago',
		dateTime: '2023-01-24T09:20',
	},
]

export function UserTimeline() {
	return (
		<div>
			<h3 className="text-base font-semibold leading-6 text-gray-900">
				Your Timeline
			</h3>
			<ul className="mt-4 space-y-6">
				{activity.map((activityItem, activityItemIdx) => (
					<li key={activityItem.id} className="relative flex gap-x-4">
						<div
							className={classNames(
								activityItemIdx === activity.length - 1 ? 'h-6' : '-bottom-6',
								'absolute left-0 top-0 flex w-6 justify-center',
							)}
						>
							<div className="w-px bg-gray-200" />
						</div>
						{activityItem.type === 'commented' ? (
							<>
								<Image
									alt=""
									src={activityItem.person.imageUrl}
									className="relative mt-3 h-6 w-6 flex-none rounded-full bg-gray-50"
								/>
								<div className="flex-auto rounded-md p-3 ring-1 ring-inset ring-gray-200">
									<div className="flex justify-between gap-x-4">
										<div className="py-0.5 text-xs leading-5 text-gray-500">
											<span className="font-medium text-gray-900">
												{activityItem.person.name}
											</span>{' '}
											commented
										</div>
										<time
											dateTime={activityItem.dateTime}
											className="flex-none py-0.5 text-xs leading-5 text-gray-500"
										>
											{activityItem.date}
										</time>
									</div>
									<p className="text-sm leading-6 text-gray-500">
										{activityItem.comment}
									</p>
								</div>
							</>
						) : (
							<>
								<div className="relative flex h-6 w-6 flex-none items-center justify-center bg-white">
									{activityItem.type === 'paid' ? (
										<CheckCircleIcon
											aria-hidden="true"
											className="h-6 w-6 text-indigo-600"
										/>
									) : (
										<div className="h-1.5 w-1.5 rounded-full bg-gray-100 ring-1 ring-gray-300" />
									)}
								</div>
								<p className="flex-auto py-0.5 text-xs leading-5 text-gray-500">
									<span className="font-medium text-gray-900">
										{activityItem.person.name}
									</span>{' '}
									{activityItem.type} the invoice.
								</p>
								<time
									dateTime={activityItem.dateTime}
									className="flex-none py-0.5 text-xs leading-5 text-gray-500"
								>
									{activityItem.date}
								</time>
							</>
						)}
					</li>
				))}
			</ul>
		</div>
	)
}
