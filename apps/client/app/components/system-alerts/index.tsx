import { Transition } from '@headlessui/react'
import { type PropsWithChildren } from 'react'
import { ClientOnly } from 'remix-utils/client-only'
import { CookiesPolicyBanner } from './components/cookies-policy.tsx'
import {
	useSystemAlertHandler,
	type ISystemAlertHandler,
} from './use-system-alert-handler.ts'

export interface ISystemAlert extends ISystemAlertHandler {
	/** The Alert Component */
	component: ({ onClose }: { onClose: () => void }) => JSX.Element
}

function SystemAlert({ data }: { data: ISystemAlert }) {
	const { onClose, show } = useSystemAlertHandler({
		endDate: data.endDate,
		localStorageKey: data.localStorageKey,
		startDate: data.startDate,
		identifier: data.identifier,
	})

	return (
		<Transition show={show}>
			<div className="transition duration-300 ease-in data-[closed]:opacity-0">
				<data.component onClose={onClose} />
			</div>
		</Transition>
	)
}

const systemAlerts: Array<ISystemAlert> = [
	{
		identifier: 'cookie-policy',
		startDate: new Date(2025, 2, 10),
		localStorageKey: 'mfoni-accept-cookie-policy',
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
