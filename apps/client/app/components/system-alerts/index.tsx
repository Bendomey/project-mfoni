import { Transition } from '@headlessui/react'
import { useLocalStorage } from '@uidotdev/usehooks'
import { type PropsWithChildren } from 'react'
import { ClientOnly } from 'remix-utils/client-only'
import { CookiesPolicyBanner } from './components/cookies-policy.tsx'

export interface ISystemAlert {
	/** Date to discontinue showing this alert. If this is `undefined`, the alert will always display, as long as it has not yet been dismissed. */
	endDate?: Date
	/** The Alert Component */
	component: ({ onClose }: { onClose: () => void }) => JSX.Element
	/** Key for local storage to store when alert message is dismissed. */
	localStorageKey: string
	/** Date to begin showing this alert. */
	startDate: Date
	/** Description of alert */
	identifier: string
}

const rightAboutNow = new Date()

function SystemAlert({ data }: { data: ISystemAlert }) {
	const [isClosed, setIsClosed] = useLocalStorage<boolean>(data.localStorageKey)

	function handleAlertClose() {
		setIsClosed(true)
	}

	const showBanner = Boolean(
		!isClosed &&
			rightAboutNow >= data.startDate &&
			(data?.endDate ? rightAboutNow < data.endDate : !data.endDate),
	)

	return (
		<Transition show={showBanner}>
			<div className="transition duration-300 ease-in data-[closed]:opacity-0">
				<data.component onClose={handleAlertClose} />
			</div>
		</Transition>
	)
}

const systemAlerts: Array<ISystemAlert> = [
	{
		identifier: 'cookie-policy',
		startDate: new Date(2025, 2, 10),
		localStorageKey: 'accept-cookie-policy',
		component: CookiesPolicyBanner,
	},
]

export function SystemAlertsProvider({ children }: PropsWithChildren) {
	return (
		<>
			{children}
			<ClientOnly>
				{() => {
					return systemAlerts.map((alert) => (
						<SystemAlert key={alert.identifier} data={alert} />
					))
				}}
			</ClientOnly>
		</>
	)
}
