import { useFetcher, useNavigate, useSearchParams } from '@remix-run/react'
import { useCallback, useEffect, useRef } from 'react'
import { useLoginAuth } from '../context/index.tsx'
import { type AuthenticateOutputProps } from '@/api/auth/index.ts'
import { useBreakpoint } from '@/hooks/tailwind.ts'
import { classNames } from '@/lib/classNames.ts'
import { isBrowser } from '@/lib/is-browser.ts'
import { useAuth } from '@/providers/auth/index.tsx'
import { useEnvContext } from '@/providers/env/index.tsx'

declare global {
	interface Window {
		// @TODO: type it later.
		google: any
	}
}

export const GoogleButton = () => {
	const { setIsLoading, setErrorMessage } = useLoginAuth()
	const { onSignin } = useAuth()
	const navigate = useNavigate()
	const env = useEnvContext()
	const [params] = useSearchParams()
	const fetcher = useFetcher<{ error: string; success: boolean; data: AuthenticateOutputProps }>()

	const signInRef = useRef(null)
	const isMobileBreakPoint = useBreakpoint('sm')

	useEffect(() => {
		if (fetcher?.data?.error && fetcher.state === 'idle') {
			setIsLoading(false)
			if (fetcher?.data?.error) {
				setErrorMessage(fetcher?.data?.error)
			}
		}
	}, [fetcher, setErrorMessage, setIsLoading])

	useEffect(() => {
		if (fetcher?.data?.success && fetcher.state === 'idle') {
			const successRes = fetcher?.data?.data;
			onSignin(successRes)

			const returnTo = params.get('return_to')
			if (successRes.user.role) {
				navigate(returnTo ?? '/')
			} else {
				navigate(
					`/auth/onboarding${returnTo ? `?return_to=${returnTo}` : ''
					}`,
				)
			}
		}
	}, [fetcher, navigate, onSignin, params])

	const onLoginWithGoogle = useCallback(
		async (res: any) => {
			if (res.credential) {
				setIsLoading(true)
				fetcher.submit(
					{
						provider: 'GOOGLE',
						google: {
							authToken: res.credential,
						},
					},
					{
						action: `/api/auth`,
						encType: 'multipart/form-data',
						method: 'post',
						preventScrollReset: true,
					},
				)
			}
		},
		[fetcher, setIsLoading],
	)

	const init = useCallback(() => {
		if (window.google) {
			window.google.accounts.id.initialize({
				client_id: env.MFONI_GOOGLE_AUTH_CLIENT_ID,
				callback: onLoginWithGoogle,
			})

			window.google.accounts.id.renderButton(signInRef.current, {
				theme: 'outline',
				size: 'large',
				text: 'continue_with',
				shape: 'rectangular',
				logo_alignment: 'left',
				type: 'standard',
				width: isMobileBreakPoint ? '355' : '385',
				locale: 'en-GB',
			})
		}
	}, [env.MFONI_GOOGLE_AUTH_CLIENT_ID, isMobileBreakPoint, onLoginWithGoogle])

	useEffect(() => {
		if (isBrowser) {
			init()
		}
	}, [init])

	return <div ref={signInRef} className={classNames('h-full w-full')} />
}
