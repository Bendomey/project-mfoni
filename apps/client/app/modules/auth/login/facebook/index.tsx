import { useFetcher, useNavigate, useSearchParams } from '@remix-run/react'
import { useEffect } from 'react'
import { useLoginAuth } from '../context/index.tsx'
import { type AuthenticateOutputProps } from '@/api/auth/index.ts'
import { Button } from '@/components/button/index.tsx'
import { useAuth } from '@/providers/auth/index.tsx'
import { useEnvContext } from '@/providers/env/index.tsx'

declare global {
	interface Window {
		// @TODO: type it later.
		fbAsyncInit: any
		FB: any
	}
}

export const FacebookButton = () => {
	const { setIsLoading, setErrorMessage } = useLoginAuth()
	const { onSignin } = useAuth()
	const navigate = useNavigate()
	const env = useEnvContext()
	const [params] = useSearchParams()
	const fetcher = useFetcher<{ error: string; success: boolean; data: AuthenticateOutputProps }>()

	useEffect(() => {
		window.fbAsyncInit = function () {
			window.FB.init({
				appId: env.FACEBOOK_APP_ID,
				autoLogAppEvents: true,
				xfbml: true,
				version: 'v10.0',
			})
		}
		;(function (d, s, id) {
			let js: any = d.getElementsByTagName(s)[0]
			const fjs: any = d.getElementsByTagName(s)[0]
			if (d.getElementById(id)) return
			js = d.createElement(s)
			js.id = id
			js.src = 'https://connect.facebook.net/en_US/sdk.js'
			fjs.parentNode.insertBefore(js, fjs)
		})(document, 'script', 'facebook-jssdk')
	}, [env.FACEBOOK_APP_ID])

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

	const handleLogin = (res: any) => {
		setIsLoading(true)
		fetcher.submit(
			{
				provider: 'FACEBOOK',
				facebook: {
					accessToken: res.authResponse.accessToken,
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

	const handleLoginInitiation = () => {
		if (window.FB) {
			window.FB.getLoginStatus((loginStatusResponse: any) => {
				if (loginStatusResponse.status === 'connected') {
					handleLogin(loginStatusResponse)
				} else {
					window.FB.login(
						(loginResponse: any) => {
							handleLogin(loginResponse)
						},
						{ scope: 'public_profile,email' },
					)
				}
			})
		}
	}

	return (
		<Button onClick={handleLoginInitiation} className="justify-center">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				className="h-6 w-6"
				viewBox="0 0 24 24"
				fill="currentColor"
			>
				<path stroke="none" d="M0 0h24v24H0z" fill="none" />
				<path d="M7 10v4h3v7h4v-7h3l1 -4h-4v-2a1 1 0 0 1 1 -1h3v-4h-3a5 5 0 0 0 -5 5v2h-3" />
			</svg>
			<span className="text-sm font-semibold leading-6">Facebook</span>
		</Button>
	)
}
