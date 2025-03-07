// @ts-nocheck
// import Paystack from '@paystack/inline-js';
import { useFetcher, useSearchParams } from '@remix-run/react'
import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect } from 'react'
import { BuyModal } from './buy-modal/index.tsx'
import { QUERY_KEYS } from '@/constants/index.ts'
import { useDisclosure } from '@/hooks/use-disclosure.tsx'
import { errorToast, successToast } from '@/lib/custom-toast-functions.tsx'
import { isBrowser } from '@/lib/is-browser.ts';

export type ContentSize = 'SMALL' | 'MEDIUM' | 'LARGE' | 'ORIGINAL'

interface Props {
    content: Content
    children: (props: {
        onClick: () => void
    }) => React.ReactNode
}

export function BuyButtonApi({ children, content }: Props) {
    const fetcher = useFetcher<{
        error?: string
        paymentMethod?: string
        accessCode?: string
    }>()
    const queryClient = useQueryClient()
    const [searchParams] = useSearchParams()
    const buyModalState = useDisclosure()


    useEffect(() => {
        const buyParam = searchParams.get(
            'buy',
        )
        const isBuyModalOpened = Boolean(
            buyParam &&
            buyParam !== 'false',
        )

        if (isBuyModalOpened) {
            buyModalState.onOpen()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])


    // where there is an error in the action data, show an error toast
    useEffect(() => {
        if (fetcher.state === 'idle' && fetcher?.data?.error) {
            errorToast(fetcher?.data.error, {
                id: 'error-buying-content',
            })
        }
    }, [fetcher?.data, fetcher.state])

    const initiateOneTimePayment = useCallback((accessCode: string) => {
        if (isBrowser) {
            console.log(accessCode)
            // const popup = new Paystack()
            // popup.resumeTransaction(accessCode)
        }
    }, [])

    useEffect(() => {
        if (fetcher.state === 'idle' && fetcher.data?.paymentMethod) {
            buyModalState.onClose()
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.CONTENTS, content.slug],
            })

            if (fetcher.data?.paymentMethod === 'ONE_TIME' && fetcher.data?.accessCode) {
                initiateOneTimePayment(fetcher.data.accessCode)
            } else if (fetcher.data?.paymentMethod === 'WALLET') {
                successToast('Content bought successfully', {
                    id: 'success-buying-content',
                })
            }
        }
    }, [buyModalState, content.slug, content.title, fetcher.data, fetcher.state, initiateOneTimePayment, queryClient])

    return (
        <>
            {children({ onClick: buyModalState.onOpen })}
            <BuyModal
                closeModal={buyModalState.onClose}
                isOpened={buyModalState.isOpened}
                content={content as unknown as Content}
            />
        </>
    )
}
