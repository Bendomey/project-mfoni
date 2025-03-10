import { type PropsWithChildren } from 'react'
import { AuthProvider } from './auth/index.tsx'
import { ReactQueryProvider } from './react-query/index.tsx'
import { SystemAlertsProvider } from '@/components/system-alerts/index.tsx'

interface Props {
	authData: User | null
}

export const Providers = ({ children, authData }: PropsWithChildren<Props>) => {
	return (
		<ReactQueryProvider>
			<AuthProvider authData={authData}>
				<SystemAlertsProvider>{children}</SystemAlertsProvider>
			</AuthProvider>
		</ReactQueryProvider>
	)
}
