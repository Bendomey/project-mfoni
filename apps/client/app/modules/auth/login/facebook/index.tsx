/* eslint-disable func-names */
import {useAuthenticate} from '@/api/auth/index.ts'
import {Button} from '@/components/button/index.tsx'
import {useNavigate} from '@remix-run/react'
import {useEffect} from 'react'
import {useLoginAuth} from '../context/index.tsx'
import {errorMessagesWrapper} from '@/constants/error-messages.ts'
import {toast} from 'react-hot-toast'
import {useAuth} from '@/providers/auth/index.tsx'
import {useQueryClient} from '@tanstack/react-query'
import {QUERY_KEYS} from '@/constants/index.ts'
import {useEnvContext} from '@/providers/env/index.tsx'

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
  const queryClient = useQueryClient()
  const env = useEnvContext()

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
            queryClient.setQueryData([QUERY_KEYS.CURRENT_USER], successRes.user)

            if (successRes.user.accountSetupAt) {
              navigate('/')
              toast.success(`Welcome ${successRes.user.name}`)
            } else {
              navigate('/auth/onboarding')
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
      variant="unstyled"
      externalClassName="flex w-full items-center justify-center gap-3 rounded-md bg-blue-600 px-3 py-2 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D9BF0]"
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
