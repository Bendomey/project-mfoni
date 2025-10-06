import { useFetcher } from "@remix-run/react"
import { useQueryClient } from "@tanstack/react-query"
import { useCallback, useEffect } from "react"
import { AddSavedCardModal } from "./modal.tsx"
import { ProcessingPaymentDialog } from "@/components/processing-payment-dialog.tsx"
import { QUERY_KEYS } from "@/constants/index.ts"
import { useDisclosure } from "@/hooks/use-disclosure.tsx"
import { errorToast } from "@/lib/custom-toast-functions.tsx"


interface Props {
    children: (props: {
        onClick: VoidFunction
    }) => React.ReactNode
}

export function AddCardButton({ children }: Props) {
    const queryClient = useQueryClient()
    const addCardModalState = useDisclosure()
    const processingPaymentModalState = useDisclosure()
    const fetcher = useFetcher<{
        error?: string
        accessCode?: string
    }>()

    // where there is an error in the action data, show an error toast
    useEffect(() => {
        if (fetcher.state === 'idle' && fetcher?.data?.error) {
            errorToast(fetcher?.data.error, {
                id: 'error-adding-card',
            })
        }
    }, [fetcher?.data, fetcher.state])


    const handleSubmit = (billingEmail: string) => {
        fetcher.submit(
            {
                billingEmail,
            },
            {
                action: `/api/add-saved-card`,
                encType: 'multipart/form-data',
                method: 'post',
                preventScrollReset: true,
            },
        )
    }

    const initiateOneTimePayment = useCallback(
        (accessCode: string) => {
            const popup = new window.PaystackPop()
            popup.resumeTransaction(accessCode, {
                onSuccess: () => {
                    processingPaymentModalState.onOpen()
                },
            })
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    )

    useEffect(() => {
        if (fetcher.state === 'idle' && fetcher.data?.accessCode) {
            addCardModalState.onClose()
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.SAVED_CARDS],
            })

            if (fetcher.data?.accessCode) {
                initiateOneTimePayment(fetcher.data.accessCode)
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetcher.data, fetcher.state, initiateOneTimePayment, queryClient])

    const isLoading = fetcher.state === 'submitting'

    return (
        <>
            {children({ onClick: addCardModalState.onOpen })}
            <AddSavedCardModal
                isSubmitting={isLoading}
                onSubmit={handleSubmit}
                isOpened={addCardModalState.isOpened}
                onClose={addCardModalState.onClose}
            />
            <ProcessingPaymentDialog
                isOpened={processingPaymentModalState.isOpened}
                onClose={processingPaymentModalState.onClose}
            />
        </>
    );
}
