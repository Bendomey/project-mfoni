import {initiateTwitterAuth, useAuthenticate} from '@/api/auth/index.ts'
import {Button} from '@/components/button/index.tsx'
import {TWITTER_BASE_URL} from '@/constants/index.ts'
import {useSearchParams, useLocation, useNavigate} from '@remix-run/react'
import {useCallback, useEffect} from 'react'
import {errorMessagesWrapper} from '@/constants/error-messages.ts'
import {useLoginAuth} from '../context/index.tsx'
import {useAuth} from '@/providers/auth/index.tsx'
import {errorToast, successToast} from '@/lib/custom-toast-functions.tsx'

export const TwitterButton = () => {
  const {mutate} = useAuthenticate()
  const {setErrorMessage, setIsLoading} = useLoginAuth()
  const {onSignin} = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [params] = useSearchParams()

  const checkForTwitterResponse = useCallback(() => {
    const oAuthToken = params.get('oauth_token')
    const oAuthVerifier = params.get('oauth_verifier')

    const isDenied = Boolean(params.get('denied'))
    if (isDenied) {
      params.delete('denied')
      navigate({
        ...location,
        search: params.toString(),
      })

      setErrorMessage('Twitter login was unsuccessful')
    } else if (oAuthToken?.length && oAuthVerifier?.length) {
      setIsLoading(true)

      mutate(
        {
          provider: 'TWITTER',
          twitter: {oAuthToken, oAuthVerifier},
        },
        {
          onError: error => {
            if (error.message) {
              setErrorMessage(errorMessagesWrapper(error.message))
            }
          },
          onSuccess: successRes => {
            if (successRes) {
              onSignin(successRes)

              const returnTo = params.get('return_to')
              if (successRes.user.role) {
                navigate(returnTo ?? '/')
                successToast(`Welcome ${successRes.user.name}`)
              } else {
                navigate(
                  `/auth/onboarding${returnTo ? `?return_to=${returnTo}` : ''}`,
                )
                successToast('Setup account')
              }
            }
          },
          onSettled: () => {
            setIsLoading(false)
          },
        },
      )
    }
  }, [
    location,
    mutate,
    navigate,
    onSignin,
    params,
    setErrorMessage,
    setIsLoading,
  ])

  useEffect(() => {
    checkForTwitterResponse()
  }, [checkForTwitterResponse])

  const initiateLogin = async () => {
    try {
      setIsLoading(true)
      const requestTokenData = await initiateTwitterAuth()
      if (requestTokenData.oauth_callback_confirmed === 'true') {
        window.location.replace(
          `${TWITTER_BASE_URL}/oauth/authorize?oauth_token=${requestTokenData.oauth_token}`,
        )
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        errorToast(error.message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={initiateLogin}
      className="justify-center bg-[#1D9BF0] hover:bg-[#1D9BF0]/80 px-3 py-2 "
    >
      <svg
        className="h-5 w-5"
        aria-hidden="true"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
      </svg>
      <span className="text-sm font-semibold leading-6">Twitter</span>
    </Button>
  )
}
