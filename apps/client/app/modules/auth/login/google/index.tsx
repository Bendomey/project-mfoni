import { useNavigate, useSearchParams } from '@remix-run/react'
import { useCallback, useEffect, useRef } from 'react'
import { ClientOnly } from 'remix-utils/client-only'
import { useLoginAuth } from '../context/index.tsx'
import { useAuthenticate } from '@/api/auth/index.ts'
import { errorMessagesWrapper } from '@/constants/error-messages.ts'
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
	const { mutate } = useAuthenticate()
	const { setIsLoading, setErrorMessage } = useLoginAuth()
	const { onSignin } = useAuth()
	const navigate = useNavigate()
	const env = useEnvContext()
	const [params] = useSearchParams()

	const signInRef = useRef(null)
	const isMobileBreakPoint = useBreakpoint('sm')

	const onLoginWithGoogle = useCallback(
		async (res: any) => {
			if (res.credential) {
				setIsLoading(true)
				mutate(
					{
						provider: 'GOOGLE',
						google: {
							authToken: res.credential,
						},
					},
					{
						onError: (error) => {
							if (error.message) {
								setErrorMessage(errorMessagesWrapper(error.message))
							}
						},
						onSuccess: (successRes) => {
							if (successRes) {
								onSignin(successRes)

								const returnTo = params.get('return_to')
								if (successRes.user.role) {
									navigate(returnTo ?? '/')
								} else {
									navigate(
										`/auth/onboarding${
											returnTo ? `?return_to=${returnTo}` : ''
										}`,
									)
								}
							}
						},
						onSettled: () => {
							setIsLoading(false)
						},
					},
				)
			}
		},
		[mutate, navigate, onSignin, params, setErrorMessage, setIsLoading],
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

			window.google.accounts.id.prompt()
		}
	}, [env.MFONI_GOOGLE_AUTH_CLIENT_ID, isMobileBreakPoint, onLoginWithGoogle])

	useEffect(() => {
		if (isBrowser) {
			init()
		}
	}, [init])

	return <div ref={signInRef} className={classNames('h-full w-full')} />
}
