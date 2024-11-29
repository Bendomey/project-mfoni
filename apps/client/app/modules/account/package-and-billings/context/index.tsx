import { useIsSubscriptionCancelled } from "@/api/subscriptions/index.ts"
import { type IMfoniPackageDetail, MFONI_PACKAGES_DETAILED } from "@/constants/index.ts"
import { safeString } from "@/lib/strings.ts"
import { useAuth } from "@/providers/auth/index.tsx"
import { useSearchParams } from "@remix-run/react"
import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react"

interface IPackageAndBillingsContext {
    isActiveSubscriptionCancelled: boolean
    activePackage?: IMfoniPackageDetail
    isChangePackageModalOpened: boolean
    setIsChangePackageModalOpened: React.Dispatch<React.SetStateAction<boolean>>
    isActiveSubscriptionCancelledRequestPending: boolean
}

export const PackageAndBillingsContext = createContext<IPackageAndBillingsContext>({
    isActiveSubscriptionCancelled: false,
    isChangePackageModalOpened: false,
    setIsChangePackageModalOpened: () => { },
    isActiveSubscriptionCancelledRequestPending: true
})

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Props { }

export const PackageAndBillingsProvider = ({ children }: PropsWithChildren<Props>) => {
    const [searchParams, setSearchParams] = useSearchParams()
    const [isChangePackageModalOpened, setIsChangePackageModalOpened] = useState(false)
    const { activeSubcription } = useAuth()
    const subscriptionId = safeString(activeSubcription?.id)
    const { data, isPending } = useIsSubscriptionCancelled(subscriptionId)

    const activePackage = useMemo(() => {
        if (activeSubcription?.packageType) {
            return MFONI_PACKAGES_DETAILED[
                activeSubcription.packageType
            ]
        }
    }, [activeSubcription])

    useEffect(() => {
        const changePackageParam = searchParams.get('change-package')
        if (changePackageParam && changePackageParam !== 'false') {
            setIsChangePackageModalOpened(true)
        }

    }, [searchParams, setSearchParams])

    const isActiveSubscriptionCancelled = useMemo(() => !Boolean(data) && !isPending, [data, isPending])

    return (
        <PackageAndBillingsContext.Provider
            value={{
                isActiveSubscriptionCancelled,
                isActiveSubscriptionCancelledRequestPending: isPending,
                activePackage,
                isChangePackageModalOpened,
                setIsChangePackageModalOpened
            }}
        >
            {children}
        </PackageAndBillingsContext.Provider>
    )
}

export const usePackageAndBillingsContext = () => useContext(PackageAndBillingsContext)
