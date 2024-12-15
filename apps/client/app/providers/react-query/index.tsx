import {
	QueryClient,
	QueryClientProvider,
	HydrationBoundary,
} from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { type PropsWithChildren } from 'react'
import { useDehydratedState } from '@/hooks/use-dehydrated-state.ts'

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
			// With SSR, we usually want to set some default staleTime
			// above 0 to avoid refetching immediately on the client
			staleTime: 60 * 1000,
		},
	},
})

export const ReactQueryProvider = ({ children }: PropsWithChildren) => {
	const dehydratedState = useDehydratedState()

	return (
		<QueryClientProvider client={queryClient}>
			<HydrationBoundary state={dehydratedState}>{children}</HydrationBoundary>
			<ReactQueryDevtools initialIsOpen={false} />
		</QueryClientProvider>
	)
}
