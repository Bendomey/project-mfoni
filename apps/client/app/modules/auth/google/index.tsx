import { useBreakpoint } from '@/hooks/tailwind.ts'
import { isBrowser } from '@/lib/is-browser.ts'
import { useLoaderData } from '@remix-run/react'
import { useCallback, useEffect, useRef } from 'react'

declare global {
    interface Window {
        // @TODO: type it later.
        google: any
    }
}

export const GoogleButton = () => {

    const signInRef = useRef(null)
    const data = useLoaderData<{ GOOGLE_AUTH_CLIENT_ID: string }>()
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
        <div ref={signInRef} className="w-full h-full" />
    )
}