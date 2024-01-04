import {Button} from '@/components/button/index.tsx'
import {APP_NAME} from '@/constants/index.ts'
import {useBreakpoint} from '@/hooks/tailwind.ts'
import {isBrowser} from '@/lib/is-browser.ts'
import {ArrowLeftIcon} from '@heroicons/react/24/outline'
import {useLoaderData} from '@remix-run/react'
import {useCallback, useEffect, useRef} from 'react'

declare global {
  interface Window {
    // @TODO: type it later.
    google: any
  }
}

export const LoginModule = () => {
  const signInRef = useRef(null)
  const data = useLoaderData<{GOOGLE_AUTH_CLIENT_ID: string}>()
  const isMobileBreakPoint = useBreakpoint('sm')

  function onLoginWithGoogle(res: any) {
    console.log(res)
  }

  const init = useCallback(() => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: data.GOOGLE_AUTH_CLIENT_ID,
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
      })
    }
  }, [data.GOOGLE_AUTH_CLIENT_ID, isMobileBreakPoint])

  useEffect(() => {
    if (isBrowser) {
      init()
    }
  }, [init])

  return (
    <div className="flex h-screen flex-1">
      <div className="relative hidden w-1/3 lg:block">
        <img
          className="absolute inset-0 h-full w-full object-cover"
          src="https://images.unsplash.com/photo-1496917756835-20cb06e75b4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1908&q=80"
          alt=""
        />
        <div className="absolute top-0 z-1 bg-black/70 w-full h-full p-10">
          <div className="flex flex-col h-full justify-between">
            <div />

            <div className="mt-10">
              <div className="flex flex-row items-end mb-5">
                <span className="text-5xl text-blue-700 font-extrabold">
                  {APP_NAME.slice(0, 1)}
                </span>
                <span className="text-5xl text-white font-extrabold">
                  {APP_NAME.slice(1)}
                </span>
              </div>
              <h2 className="font-bold text-2xl text-blue-100">
                The best photo gallery shared by creators in ghana.
              </h2>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-1 flex-col w-2/3 justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <div className="flex">
              <Button
                isLink
                href="/"
                variant="unstyled"
                externalClassName="flex flex-wrap flex-row items-center hover:bg-zinc-100 p-2 rounded-lg"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-3" />
                <span className="font-bold">Go Back</span>
              </Button>
            </div>
            <h2 className="mt-8 text-4xl md:text-5xl font-bold leading-9 tracking-tight text-gray-900">
              Welcome back 👋🏽
            </h2>
            <p className="mt-2 ml-2 leading-6 text-gray-500">
              Continue with your favorite social.
            </p>
          </div>

          <div className="mt-16">
            <div className="mt-10">
              <div className="mt-6 grid grid-cols-1 gap-4">
                <div ref={signInRef} className="w-full h-full" />

                <Button
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
                  <span className="text-sm font-semibold leading-6">
                    Facebook
                  </span>
                </Button>

                <Button
                  variant="unstyled"
                  externalClassName="flex w-full items-center justify-center gap-3 rounded-md bg-[#1D9BF0] px-3 py-2 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D9BF0]"
                >
                  <svg
                    className="h-5 w-5"
                    aria-hidden="true"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                  <span className="text-sm font-semibold leading-6">
                    Twitter
                  </span>
                </Button>

                <Button
                  variant="unstyled"
                  externalClassName="flex w-full items-center justify-center gap-3 rounded-md bg-[#24292F] px-3 py-2 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#24292F]"
                >
                  <svg
                    className="h-7 w-7 text-white"
                    viewBox="0 0 24 24"
                    fill="#fff"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M9 7c-3 0 -4 3 -4 5.5c0 3 2 7.5 4 7.5c1.088 -.046 1.679 -.5 3 -.5c1.312 0 1.5 .5 3 .5s4 -3 4 -5c-.028 -.01 -2.472 -.403 -2.5 -3c-.019 -2.17 2.416 -2.954 2.5 -3c-1.023 -1.492 -2.951 -1.963 -3.5 -2c-1.433 -.111 -2.83 1 -3.5 1c-.68 0 -1.9 -1 -3 -1z" />
                    <path d="M12 4a2 2 0 0 0 2 -2a2 2 0 0 0 -2 2" />
                  </svg>
                  <span className="text-sm font-semibold leading-6">Apple</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
