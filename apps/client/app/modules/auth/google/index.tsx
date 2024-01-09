import { useAuthenticate } from '@/api/auth/index.ts'
import { useBreakpoint } from '@/hooks/tailwind.ts'
import { isBrowser } from '@/lib/is-browser.ts'
import { useLoaderData } from '@remix-run/react'
import { useCallback, useEffect, useRef } from 'react'
import { useLoginAuth } from '../context/index.tsx'
import { errorMessagesWrapper } from '@/constants/error-messages.ts'
import { toast } from 'react-hot-toast'

declare global {
    interface Window {
        // @TODO: type it later.
        google: any
    }
}

export const GoogleButton = () => {
    const { mutate } = useAuthenticate()
    const { setIsLoading, setErrorMessage } = useLoginAuth()

    const signInRef = useRef(null)
    const data = useLoaderData<{ GOOGLE_AUTH_CLIENT_ID: string }>()
    const isMobileBreakPoint = useBreakpoint('sm')


    const onLoginWithGoogle = useCallback(async (res: any) => {
        if (res.credential) {
            setIsLoading(true)
            mutate({
                provider: 'GOOGLE',
                google: {
                    authToken: res.credential,
                }
            }, {
                onError: (error) => {
                    if (error.message) {
                        setErrorMessage(errorMessagesWrapper(error.message))
                    }
                },
                onSuccess: (successRes) => {
                    console.log(successRes)
                    toast.success(`Welcome ${successRes?.user.name ?? ''}`)
                    //save token to cookies
                },
                onSettled: () => {
                    setIsLoading(false)
                }
            })
        }
    }, [mutate, setErrorMessage, setIsLoading])

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
    }, [data.GOOGLE_AUTH_CLIENT_ID, isMobileBreakPoint, onLoginWithGoogle])

    useEffect(() => {
        if (isBrowser) {
            init()
        }
    }, [init])

    return (
        <div ref={signInRef} className="w-full h-full" />
    )
}