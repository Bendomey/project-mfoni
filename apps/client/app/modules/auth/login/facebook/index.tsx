/* eslint-disable func-names */
import {useAuthenticate} from '@/api/auth/index.ts'
import {Button} from '@/components/button/index.tsx'
import {useNavigate, useSearchParams} from '@remix-run/react'
import {useEffect} from 'react'
import {useLoginAuth} from '../context/index.tsx'
import {errorMessagesWrapper} from '@/constants/error-messages.ts'
import {toast} from 'react-hot-toast'
import {useAuth} from '@/providers/auth/index.tsx'
import {useEnvContext} from '@/providers/env/index.tsx'
import { getFullUrlPath } from '@/lib/url-helpers.ts'

declare global {
  interface Window {
    // @TODO: type it later.
    fbAsyncInit: any
    FB: any
  }
}

export const FacebookButton = () => {
  const {mutate} = useAuthenticate()
  const {setIsLoading, setErrorMessage} = useLoginAuth()
  const {onSignin} = useAuth()
  const navigate = useNavigate()
  const env = useEnvContext()
  const [params] = useSearchParams()

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
  }, [])

  const handleLogin = (res: any) => {
    setIsLoading(true)

    mutate(
      {
        provider: 'FACEBOOK',
        facebook: {
          accessToken: res.authResponse.accessToken,
        },
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
              toast.success(`Welcome ${successRes.user.name}`)
            } else {
              navigate(`/auth/onboarding${returnTo ? `?return_to=${getFullUrlPath(new URL(returnTo))}` : ''}`)
              toast.success('Setup account')
            }
          }
        },
        onSettled: () => {
          setIsLoading(false)
        },
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
            {scope: 'public_profile,email'},
          )
        }
      })
    }
  }

  return (
    <Button
      onClick={handleLoginInitiation}
      className='justify-center'
    >
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
