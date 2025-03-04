import { type PropsWithChildren } from 'react'
import { AuthProvider } from './auth/index.tsx'
import { ReactQueryProvider } from './react-query/index.tsx'

interface Props {
	authData: User | null
}

export const Providers = ({ children, authData }: PropsWithChildren<Props>) => {
	return (
		<ReactQueryProvider>
			<AuthProvider authData={authData}>{children}</AuthProvider>
		</ReactQueryProvider>
	)
}
